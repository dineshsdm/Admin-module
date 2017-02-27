import { Mongo } from 'meteor/mongo'

export const Setting = new Mongo.Collection('setting');
export const Inappropriate = new Mongo.Collection('inappropriate');