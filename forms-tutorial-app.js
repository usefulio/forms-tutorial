Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  Forms.mixin(Template.TasksForm, {
    'schema': {
      'task': function (val) {
        var max = 60;
        if (_.isUndefined(val)) {
          return 'No task input detected!';
        }
        if (val.length > max)
          return 'Task must not exceed ' + max + ' characters!';
      }
      , 'comments': function (val) {
        var max = 140;
        if (! _.isUndefined(val) && val.length > max)
          return 'Task must not exceed ' + max + ' characters!'; 
      }
    }
  });

  Template.TasksForm.events({
    'click button': function (e, tmpl) {
      e.preventDefault();
      tmpl.form.validate();

      if (tmpl.form.isValid()) {
        var data = {
          task: tmpl.form.doc('task') || ''
          , comments: tmpl.form.doc('comments') || ''
          , createdAt: new Date()
        }
        Tasks.insert(data);
        tmpl.form.doc({
          'task': ''
          , 'comments': ''
        })
      } else {
        _.each(tmpl.form.errors(), function (error) {
          $('input[name=' + error.name + ']').addClass('invalid');
        });
      }
    }
  });

  Template.TasksList.helpers({
    'tasks': function () {
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
