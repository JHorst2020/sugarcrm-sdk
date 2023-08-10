import dotenv from 'dotenv';
import app from './src/app';

dotenv.config();

// Deconstructing the app and exporting it as both default and named
const { ...myApp } = app;

export {
  myApp as default,
  myApp as app
};
