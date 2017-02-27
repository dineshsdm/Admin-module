import './common';

// Load collections
import './collections/files';
import './collections/thumbnails';
import './collections/dishimages';
import './collections/restauimages';

if (Meteor.isServer) {
    require('./server/index');
}
