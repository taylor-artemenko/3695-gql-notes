const graphql = require('graphql');
const _ = require('lodash');

const { 
    GraphQLSchema, 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString,
    GraphQLList
} = graphql;

// Mock data - only basic attributes from our schema are included
let notes = [
    { id: '1', title: 'Note 1', description: 'Description 1', contents: 'Contents 1', priority: 'low', user_id: '1' },
    { id: '2', title: 'Note 2', description: 'Description 2', contents: 'Contents 2', priority: 'high', user_id: '2' },
    { id: '3', title: 'Note 3', description: 'Description 3', contents: 'Contents 3', priority: 'medium', user_id: '1' }
];

let users = [
    { id: '1', username: 'tartemenko', email: 'tartemenko@my.bcit.ca' },
    { id: '2', username: 'wta', email: 'wta@my.bcit.ca' }
];

const NoteType = new GraphQLObjectType({
    name: 'Note',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        contents: { type: GraphQLString },
        priority: {type: GraphQLString },
        user: {
            type: UserType,
            resolve(parent, args) {
                const result = _.find(users, { id: parent.user_id });

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
                const result = _.filter(notes, { user_id: parent.id });

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
                const result = _.find(notes, { id: args.id });

                return result;
            }
        },
        // Get all Notes
        notes: {
            type: new GraphQLList(NoteType),
            resolve(parent, args){
                return notes
            }
        },
        // Get list of Notes by priority
        notesByPriority: {
            type: new GraphQLList(NoteType),
            args: {
                priority: { type: GraphQLString }
            },
            resolve(parent, args){
                const result = _.filter(notes, { priority: args.priority });

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
                const result = _.find(users, { username: args.username });

                return result;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});
