require("dotenv").config();

const { response } = require("express");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");

// const mongoose = require("mongoose");
// require("dotenv/config");

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then((db) => {
//     console.log(`Connected to db ${db.connection.name}`);
//   })
//   .catch(console.log);

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");

app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.getMaxListeners("/", (req, res) => {
  res.render("layout");
});
// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);

app.get("/", (req, res, next) => {
  res.render("home");
});

app.get("/artists-search", (req, res, next) => {
  spotifyApi
    .searchArtists(req.query.theArtistName)
    .then((data) => {
      //   console.log(
      //     `the received data from the API:`,
      //     data.body.artists.items[0].id
      //   );
      res.render("artist-search-results", {
        allTheArtists: data.body.artists.items,
      });
    })
    .catch((err) => console.log("Error while getting the artists: ", err));
});

app.get("/albums/:artistId", (req, res, next) => {
  spotifyApi.getArtistAlbums(req.params.artistId).then(
    (data) => {
      console.log("Artist albums", data.body);
      res.render("albums", { albums: data.body.items });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/tracks/:tracksId", (req, res, next) => {
  spotifyApi.getAlbumTracks(req.params.tracksId, { limit: 5, offset: 1 }).then(
    function (data) {
      console.log(data.body);
      res.render("tracks", { tracks: data.body.items });
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});
