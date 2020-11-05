const graphql = require('graphql');
const cloudinary = require('cloudinary').v2;
const Note = require('../models/note');
const User = require('../models/user');
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
      },
      async resolve(parent, args) {

        if (args.image !== undefined) {
          const { createReadStream } = await args.image;
          const stream = createReadStream();
          await new Promise((resolve, reject) => {
            const streamLoad = cloudinary.uploader.upload_stream(function (error, result) {
              if (result) {
                const resultUrl = result.secure_url;
                const resultSecureUrl = result.secure_url;
                let note = new Note({
                  title: args.title,
                  description: args.description,
                  contents: args.contents,
                  priority: args.priority,
                  userID: args.userID,
                  image_url: resultSecureUrl
                });
                note.save();
                resolve(resultUrl)
              } else {
                reject(error);
              }
            });
            stream.pipe(streamLoad);
          });

          let note = new Note({
            title: args.title,
            description: args.description,
            contents: args.contents,
            priority: args.priority,
            userID: args.userID,
          });

          return note;
        } else {
          let note = new Note({
            title: args.title,
            description: args.description,
            contents: args.contents,
            priority: args.priority,
            userID: args.userID,
          });

          return note.save();
        }
      },
    },
    updateNote: {
      type: NoteType,
      args: {
        id: { type: GraphQLString },
        image: { type: GraphQLUpload },
      },
      async resolve(parent, args) {
        let found = Note.findById(args.id);

        const { createReadStream } = await args.image;
        const stream = createReadStream();
        await new Promise((resolve, reject) => {
          const streamLoad = cloudinary.uploader.upload_stream(function (error, result) {
            if (result) {
              const resultUrl = result.secure_url;
              const resultSecureUrl = result.secure_url;
              found.updateOne({ image_url: resultSecureUrl });
              resolve(resultUrl)
            } else {
              reject(error);
            }
          });
          stream.pipe(streamLoad);
        });

        let updatedNote = new Note({
          id: args.id,
        })

        return updatedNote;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
