import { Mongo } from 'meteor/mongo'

export const Dishes = new Mongo.Collection('dishes');
export const Restaurants = new Mongo.Collection('restaurants');
export const Reviews = new Mongo.Collection('reviews');
export const Followers = new Mongo.Collection('followers');
export const Following = new Mongo.Collection('following');
