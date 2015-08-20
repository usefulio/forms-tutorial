Tasks = new Mongo.Collection("tasks");
var timeoutHandle;

if (Meteor.isClient) {
  Forms.mixin(Template.TasksForm, {
    'schema': {
      'task': function (val) {
        var max = 60;
        if (_.isUndefined(val) || val.length === 0) {
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

  Template.TasksForm.onRendered(function () {
    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15 // Creates a dropdown of 15 years to control year
    });
  });

  Template.TasksForm.helpers({
    'tasks': function () {
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.TasksForm.events({
    'documentSubmit': function (e, tmpl, doc) {
      tmpl.form.validate();
      if (tmpl.form.isValid()) {
        var data;
        if (doc._id) {
          data = {
            task: tmpl.form.doc('task') || ''
            , comments: tmpl.form.doc('comments') || ''
            , dateDue: tmpl.form.doc('dateDue') || ''
            , modifiedAt: new Date()
          }
          Tasks.update(tmpl.form.doc('_id'), {$set: data});
        } else {
          data = {
            task: tmpl.form.doc('task') || ''
            , comments: tmpl.form.doc('comments') || ''
            , dateDue: tmpl.form.doc('dateDue') || ''
            , createdAt: new Date()
          }
          Tasks.insert(data);
        }
        defaultForm(tmpl);
      } else {
        _.each(tmpl.form.errors(), function (error) {
          $('input[name=' + error.name + ']').addClass('invalid');
        });
      }
    }
    , 'click .collection-item': function (e, tmpl) {
      e.preventDefault();
      $('.collection-item').removeClass('active');
      $(e.currentTarget).addClass('active');
      $('html, body').animate({ scrollTop: 0 }, "slow");

      $('.default-form').removeClass('hide');

      tmpl.form.doc({
        'task': $(e.currentTarget).find('h5').text()
        , 'comments': $(e.currentTarget).find('p.comments').text()
        , 'dateDue': $(e.currentTarget).find('p.dateDue').text()
        , '_id': $(e.currentTarget).find('input[name="_id"]').val()
      })
      $('label').addClass('active');
    }
    , 'click .default-form': function (e, tmpl) {
      e.preventDefault();
      defaultForm(tmpl);
    }
    , 'keyup form': function (e, tmpl) {
      clearTimeout(timeoutHandle);
      timeoutHandle = Meteor.setTimeout(function () {
        $(e.target).blur();
        tmpl.form.submit(e.currentTarget);
      }, 4000); // If user doesn't type anything for 4 seconds, submit the form
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

function defaultForm (tmpl) {
  $('.default-form').addClass('hide');
  $('.collection-item').removeClass('active');

  tmpl.form.doc({
    'task': ''
    , 'comments': ''
    , 'dateDue': ''
  })
}