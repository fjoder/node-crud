const Event = require('../models/event');
module.exports = {
  showEvents: showEvents,
  showSingle: showSingle,
  seedEvents: seedEvents,
  showCreate: showCreate,
  processCreate: processCreate,
  showEdit: showEdit,
  processEdit: processEdit,
  deleteEvent: deleteEvent
}

  // show all events
  function showEvents(req, res) {
    // get all events
    Event.find({}, (err, events) => {
      if (err) {
        res.status(404);
        res.send('Events not found!');
      }

       // return a view with data
      res.render('pages/events', { 
        events: events,
        success: req.flash('success')
      });
    });
  }

  // show a single event
  function showSingle(req, res) {
    //get a single event
    Event.findOne({ slug: req.params.slug }, (err, event) => {
      if (err) {
        res.status(404);
        res.send('Event not found!');
      }

      res.render('pages/single', { 
        event: event,
        success: req.flash('success') 
      });
    });
  }

  // seed our database
  function seedEvents(req, res) {
    // create some events
    const events = [
      { name: 'Basketball',    description: 'Throwing into a basket.' },
      { name: 'Swimming',      description: 'Michael Phelps is the fast fish.' },
      { name: 'Weightlifting', description: 'Less talky, more lifty.' },
      { name: 'Ping Pong',     description: 'Small white balls on the fly.' }      
    ];

    // use the Event model to insert/save
    Event.remove({}, () => {
      for (event of events) {
        var newEvent = new Event(event);
        newEvent.save();
      }
    });

    // seeded!
    res.send('Database seeded!');
  }

  function showCreate(req, res) {
    res.render('pages/create', {
      errors: req.flash('errors')
    });
  }

  function processCreate(req, res) {
    // validate information
    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('description', 'Description is required.').notEmpty();

    // if there are errors, rediredt and save to errors to flash
    const errors = req.validationErrors();
    if (errors) {
      req.flash('errors', errors.map(err => err.msg));
      return res.redirect('/events/create');
    }
    
    // create a new event
    const event = new Event({
      name: req.body.name,
      description: req.body.description
    });

    event.save((err) => {
      if (err) {
        throw err;
      }
      // set a successful flash message
      req.flash('success', 'Successfully create an event!');

      // redirect to newly created event
      res.redirect(`/events/${ event.slug }`);
    });
  }

  function showEdit(req, res) {
    Event.findOne({ slug: req.params.slug }, (err, event) => {
      res.render('pages/edit', {
        event: event,
        errors: req.flash('errors')
      });
    });
  }

  function processEdit(req, res) {
    // validate information
    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('description', 'Description is required.').notEmpty();

    // if there are errors, rediredt and save to errors to flash
    const errors = req.validationErrors();
    if (errors) {
      req.flash('errors', errors.map(err => err.msg));
      return res.redirect(`/events/${ req.params.slug }/edit`);
    }
    
    // finding a current event
    Event.findOne({ slug: req.params.slug }, (err, event) => {
      // update the event found
      event.name = req.body.name;
      event.description = req.body.description;

      event.save((err) => {
        if (err) {
          throw err;
        }

        // success flash maessage and redirect back to the events
        req.flash('success', 'Successfully updated event.');
        res.redirect('/events');
      });
    });
  }

  function deleteEvent(req, res) {
    Event.remove({ slug: req.params.slug }, (err) => {
      // set flash data
      // redirect back to the events page
      req.flash('success', 'Event deleted!');
      res.redirect('/events');
    })
  }
