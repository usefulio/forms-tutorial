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
    , 'invalidInputClass': function (name) {
      var tmpl = Template.instance();
      return tmpl.form.error(name) ? 'invalid' : '';
    }
    , 'activeTaskClass': function () {
      var tmpl = Template.instance();
      return (tmpl.form.doc('_id') == this._id) ? 'active' : '';
    }
  });

  Template.TasksForm.events({
    'documentSubmit': function (e, tmpl, doc) {
      if (tmpl.form.isValid()) {
        if (doc._id) {
          doc = _.extend(doc, { modifiedAt: new Date() });
          Tasks.update(doc._id, {$set: doc});
        } else {
          doc = _.extend(doc, { createdAt: new Date() });
          Tasks.insert(doc);
          defaultForm(tmpl);
        }
      }
    }
    , 'click .collection-item': function (e, tmpl) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, "slow");
      tmpl.form.doc(this);
      $('label').addClass('active');
    }
    , 'click .default-form': function (e, tmpl) {
      e.preventDefault();
      defaultForm(tmpl);
    }
    , 'keyup form': function (e, tmpl) {
      clearTimeout(timeoutHandle);
      timeoutHandle = Meteor.setTimeout(function () {
        $(e.target).trigger('change');
        tmpl.form.submit(e.currentTarget);
      }, 4000); // If user doesn't type anything for 4 seconds, submit the form
    }
  });
}

function defaultForm (tmpl) {
  tmpl.form.doc({
    'task': ''
    , 'comments': ''
    , 'dateDue': ''
  })
}