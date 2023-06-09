import 'dotenv/config'
import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt'
import renderHome from './views/home'
import assembleGroups from './actions/assembleGroups'
import { addUser, removeUser } from './actions/manageUsers'

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.event('app_home_opened', ({event, client}: SlackEventMiddlewareArgs<'app_home_opened'> & AllMiddlewareArgs) => renderHome(client, event.user));
app.action('add_user', addUser)
app.action('remove_user', removeUser)
app.action('assemble', assembleGroups);


app.start(process.env.PORT || 3000)
  .then(() => console.log('⚡️ Bolt app is running!'))
  .catch(console.error)
