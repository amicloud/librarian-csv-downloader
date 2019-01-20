const PlayMusic = require('playmusic');
const json2csv = require('json2csv').parse;
const prompts = require('prompts');
const fs = require("fs");
const sorry = `That shouldn't have happened... Please create an issue on Github with the above error message. Thanks. Sorry!`;

async function getAllTracks() {
    let pm = new PlayMusic();
    console.log(`Please make sure "Allow Less Secure Apps" is enabled on your account before proceeding.`);
    let response = await prompts([
        {
            type: 'text',
            name: 'username',
            message: 'Google account email: '
        },
        {
            type: 'password',
            name: 'password',
            message: "Google account password: "
        }
    ]);
    let username = response['username'];
    let password = response['password'];
    console.log("Attempting to log in...");
    pm.login({email: username, password: password}, function (err, info) {
        if (err) {
            console.log(`Invalid username or password. (Or maybe "Allow Less Secure Apps" is off?) Please try again.`);
            console.log(`If "Allow Less Secure Apps" is on, check your email for a security confirmation.`);
            getAllTracks();
        } else {
            console.log("Logged in successfully!\n" +
                "Initializing client...");
            pm.init({androidId: info.androidId, masterToken: info.masterToken}, function (err) {
                if (err) {
                    console.error(err);
                    console.log(sorry);
                    return;
                }
                console.log("Client initialized!\n" +
                    "Attempting to fetch almost 50,000 songs...");
                pm.getAllTracks({limit: 49990}, function (err, library) {
                    if (err) {
                        console.error(err);
                        console.log(sorry);
                        return;
                    }
                    console.log("Library retrieved! Found " + library.data.items.length + " songs.");
                    if (library) {
                        let filename = `gpm_library_${Date.now()}.csv`;
                        fs.writeFileSync(filename, json2csv(library.data.items));
                        console.log(`Created ${filename} in ${process.cwd()}`);
                        setTimeout(() => {
                        }, 5500)
                    } else {
                        console.log("No songs found. Huh? ¯\\_(ツ)_/¯");
                        console.log("Are you sure this is the right account?");
                    }
                });
            });
        }

    });
}

getAllTracks();
