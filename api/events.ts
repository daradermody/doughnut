import type { VercelRequest, VercelResponse } from '@vercel/node'
import validateSlackRequest from './_hiddenFunctions/validate'
import renderHome from './_hiddenFunctions/views/home'

export default async function events(req: VercelRequest, res: VercelResponse) {
  const type = req.body.type
  if (type === 'url_verification') {
    return res.status(200).send({challenge: req.body.challenge})
  }

  if (!await validateSlackRequest(req, process.env.SLACK_SIGNING_SECRET as string)) {
    return res.status(401).send('Unauthorised')
  }

  if (type !== 'event_callback') {
    return res.status(400).send('Bad request')
  }

  const eventType = req.body.event.type
  if (eventType === 'app_home_opened') {
    await renderHome(req.body.event.user)
  }
  return res.status(200).end()
}
