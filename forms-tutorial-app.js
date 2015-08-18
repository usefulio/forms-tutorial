Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  Forms.mixin(Template.TasksForm);

  Template.TasksForm.events({
    'documentSubmit': function (e, tmpl) {
      var task = tmpl.form.doc('task');
      if (task && task.length) {
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
        console.warn('No task input detected!');
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
