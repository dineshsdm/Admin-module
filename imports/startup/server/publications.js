// Publish files and thumbnails
Meteor.publish('files', function (fields, options) {
    fields = _.extend({}, fields, {});
    options = _.extend({}, options, {});

    if (!this.userId) {
        // Publish only public files
        // with no userId attached.
        fields.userId = null;
    }
    return [
        Files.find(fields, options),
        Thumbnails.find(fields, options)
    ];
});
