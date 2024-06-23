const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} = require("discord.js");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function getCalendarEvents(calendarId) {
  const auth = await authorize();
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: new Date().toISOString(),
  });
  return res.data.items;
}

function updateCalendar(client, guildId, calendarId) {
  client.guilds.fetch(guildId).then((guild) => {
    guild.scheduledEvents?.fetch().then((existingEvents) => {
      getCalendarEvents(calendarId).then((events) => {
        // no events found
        if (!events || events.length === 0) {
          return;
        }
    
        events.forEach((event) => {
          if (!event.summary) {
            return;
          }

          const prefixIndex =
            event.summary.indexOf("@") === -1
              ? 0
              : event.summary.indexOf("@") + 1;
          const name = event.summary.substring(
            prefixIndex + 1,
            event.summary.length
          );

          // requires exact start and end time
          if (
            !event.start ||
            !event.end ||
            !event.start.dateTime ||
            !event.end.dateTime
          ) {
            return;
          }

          const start = Date.parse(event.start.dateTime);
          const end = Date.parse(event.end.dateTime);

          // checking if event is already created
          for (const existingEventResponse of existingEvents) {
            const existingEvent = existingEventResponse[1];
            if (
              existingEvent.name === name &&
              existingEvent.scheduledStartTimestamp === start.valueOf() &&
              existingEvent.scheduledEndTimestamp === end.valueOf()
            ) {
              return;
            }
          }

          // can use the location field if set
          const location = event.location ?? "N/A";

          guild.scheduledEvents.create({
            name: name,
            scheduledStartTime: start,
            scheduledEndTime: end,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
              location: location,
            },
          });
        });
      });
    });
  });
}

module.exports = {
  updateCalendar,
};
