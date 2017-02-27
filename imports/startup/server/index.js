import {UploadFS} from 'meteor/jalik:ufs';
import './register-api.js';
import './useraccounts.js';
import './reset-password-email.js';
// Load config
import './conf/uploadfs';

// Load methods and publications
import './methods';
import './publications';

// Load stores
import './stores/thumbnails';
import './stores/files';
import './stores/dishes';
import './stores/restau_images';
import './stores/video_thumb';