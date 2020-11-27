const graphql = require('graphql');
const cloudinary = require('cloudinary').v2;
const Note = require('../models/note');
const User = require('../models/user');
const Upcoming = require('../models/upcoming');
const cloudConf = require('../conf/cloudConf.js');

cloudinary.config({
  cloud_name: cloudConf.cloud_name,
  api_key: cloudConf.api_key,
  api_secret: cloudConf.api_secret
});

const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLID, 
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} = graphql;
const { GraphQLUpload } = require('graphql-upload');

const NoteType = new GraphQLObjectType({
  name: 'Note',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    contents: { type: GraphQLString },
    priority: {type: GraphQLString },
    image_url: {type: GraphQLString},
    dueDate: { type: GraphQLString },
    user: {
      type: UserType,
      resolve(parent, args) {
        const result = User.findById(parent.userID);

        return result;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    notes: {
      type: new GraphQLList(NoteType),
      resolve(parent, args) {
        const result = Note.find({ userID: parent.id });

        return result;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Get single Note based on ID
    note: {
      type: NoteType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args) {
        const result = Note.findById(args.id);

        return result;
      }
    },
    // Get all Notes
    notes: {
      type: new GraphQLList(NoteType),
      resolve(parent, args) {
        const result = Note.find({});

        return result;
      }
    },
    // Get all upcoming notes
    upcomingNotes: {
      type: new GraphQLList(NoteType),
      resolve(parent, args) {
        const result = Upcoming.find({});

        return result;
      }
    },
    // Get list of Notes by priority
    notesByPriority: {
      type: new GraphQLList(NoteType),
      args: {
        priority: { type: GraphQLString }
      },
      resolve(parent, args) {
        const result = Note.find({ priority: args.priority });

        return result;
      }
    },
    // Get list of Notes by title (titles can be the same)
    notesByTitle: {
      type: new GraphQLList(NoteType),
      args: {
        title: { type: GraphQLString }
      },
      resolve(parent, args) {
        const result = Note.find({ title: args.title });

        return result
      }
    },
    // Get single user based on username
    user: {
      type: UserType,
      args: {
        username: { type: GraphQLString }
      },
      resolve(parent, args) {
        const result = User.findOne({ username: args.username });

        return result;
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve(parent, args) {
        let user = new User({
          username: args.username,
          email: args.email
        });
                
        return user.save();
      }
    },
    addNote: {
      type: NoteType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        contents: { type: GraphQLString },
        priority: {type: GraphQLString },
        userID: { type: GraphQLID },
        image: { type: GraphQLUpload },
        dueDate: { type: GraphQLString }
      },
      async resolve(parent, args) {
        let note = new Note({
          title: args.title,
          description: args.description,
          contents: args.contents,
          priority: args.priority,
          userID: args.userID,
          dueDate: args.dueDate
        })

        if (args.image !== undefined) {
          const { createReadStream } = await args.image;
          const stream = createReadStream();
          await new Promise((resolve, reject) => {
            const streamLoad = cloudinary.uploader.upload_stream(function (error, result) {
              if (result) {
                const resultUrl = result.secure_url;
                const resultSecureUrl = result.secure_url;
                note.image_url = [resultSecureUrl];
                note.save();
                resolve(resultUrl)
              } else {
                reject(error);
              }
            });
            stream.pipe(streamLoad);
          });

          return note;
        } else {
          let note = new Note({
            title: args.title,
            description: args.description,
            contents: args.contents,
            priority: args.priority,
            userID: args.userID,
            dueDate: args.dueDate
          });

          return note.save();
        }
      },
    },
    updateNote: {
      type: GraphQLBoolean,
      args: {
        id: { type: GraphQLID },
        image: { type: GraphQLUpload },
      },
      async resolve(parent, args) {
        let found = Note.findById(args.id);
        let resultSecureUrl = '';

        const { createReadStream } = await args.image;
        const stream = createReadStream();
        await new Promise((resolve, reject) => {
          const streamLoad = cloudinary.uploader.upload_stream(function (error, result) {
            if (result) {
              const resultUrl = result.secure_url;
              resultSecureUrl = result.secure_url;
              resolve(resultUrl)
            } else {
              reject(error);
            }
          });
          stream.pipe(streamLoad);
        });
        await found.updateOne({ $push: {image_url: resultSecureUrl } });
        return true;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
