# Run Osmosis on Arch Linux

## First-time setup

Git and Python are available from the official Arch repositories:

```sh
sudo pacman -Syu git python
```

Clone the Osmosis branch and start the local app (replace the branch value if you use a different branch):

```sh
git clone --branch arena/ead8efb0-osmosis-learn --single-branch https://github.com/nates-lobster/osmosis-learn.git
cd osmosis-learn
python server.py
```

Open <http://localhost:8000> in your browser. Keep the terminal running while you study.

## Updating later

Stop the app with `Ctrl+C`, then:

```sh
cd ~/osmosis-learn
git pull --ff-only
python server.py
```

The saved bank and progress live in `user_data/osmosis-state.json`. `user_data/` is git-ignored, so pulling code updates leaves it untouched. To back up or transfer your learning data, copy that JSON file with Osmosis stopped. Do not commit it if it contains personal or copyrighted study material.

If you use a different folder for the clone, `cd` to that folder before pulling and running the server. If you prefer a graphical browser, open `http://localhost:8000`, not the HTML file directly.
