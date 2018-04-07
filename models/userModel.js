const _ = require('lodash'),
  mongoose = require('mongoose'),
  validator = require('validator'),
  crypto = require('crypto'),
  deepPopulate = require('mongoose-deep-populate')(mongoose);

const UserSchema = new mongoose.Schema({
  regHash: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: false,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
      isAsync: false
    }
  },
  passwordHash: String,
  salt: String,
  signupHash: String,
  passwordRestoreHash: String,
  socials: {type: mongoose.Schema.Types.Mixed, default: {}},
  practice: [{type: mongoose.Schema.Types.ObjectId, ref: 'Practice'}],
  tasks: [{ type : mongoose.Schema.Types.ObjectId, ref: 'UserTask', deault: [] }],
}, {
  timestamps: true
});

UserSchema.virtual('id')
  .get(function () {
    return this._id;
  });

UserSchema.virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    if (password) {
      this.salt = crypto.randomBytes(128).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function () {
    return this._plainPassword;
  });

UserSchema.methods.checkPassword = function (password) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

UserSchema.virtual('signupKey')
  .set(function(value) {
    if(value)
      this.signupHash = crypto.randomBytes(64).toString('hex');
    else
      this.signupHash = undefined;
  })
  .get(function() {
    return this.signupHash;
  });

UserSchema.plugin(deepPopulate, {
  populate: {
    'tasks': {
      select: {status: 1, completedAt: 1, pickedAt: 1, task: 1, _id: 1}
    },
    'tasks.task': {
      select: {_id: 0, __v: 0, updatedAt: 0}
    }
  }
});

UserSchema.methods.filterTasks = function (opts, select) {
  const {type, offset, count} = opts;
  select = Array.isArray(select) || false;
  const filterType = (_.indexOf(['all', 'done', 'undone'], type) !== -1) ? type : 'all';

  let tasks = _.get(this.toJSON(), 'tasks', []);
  
  return _.chain(tasks)
    .map(t => _.merge(t, t.task))
    .map(t => _.omit(t, 'task'))
    .filter(t => (filterType == 'done' && t.completedAt) 
      || (filterType == 'undone' && !t.completedAt) 
      || (filterType == 'all') 
      || false)
    .map(t => _.pick(t, select || _.keys(t)))
    .slice(offset)
    .chunk(count)
    .nth(0)
    .value() || [];
};

module.exports = mongoose.model('User', UserSchema);
