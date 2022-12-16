const envFileName = ".env";
const catchup = false;

let distFolderName = "dist";

const fs = require("fs");
const path = require("path");

const filesPath = path.join(__dirname, "files");
const gitPath = path.join(filesPath, ".git");
const gitBackupPath = path.join(__dirname, ".gitbackup");
const gitExists = fs.existsSync(gitPath);

const envPath = path.resolve(process.cwd(), envFileName);
const envExists = fs.existsSync(envPath);

if (!envExists && gitExists) {
    console.log("\x1b[38mMissing .env file!\x1b[0m");
    return;
}

const envFileContent = fs.readFileSync(envPath);
const env = envExists ? require("dotenv").parse(envFileContent) : {};

const ftpUrl = env.FTP_URL;
const ftpUser = env.FTP_USER;
const ftpPassword = env.FTP_PASSWORD;

if (!envExists && (!ftpUrl || !ftpUser || !ftpPassword)) {
    console.log(
        "\x1b[38mMissing FTP credentials! You need to fill FTP_URL, FTP_USER and FTP_PASSWORD in .env file.\x1b[0m"
    );
    return;
}

if (env.FTP_DIST_FOLDER) {
    distFolderName = env.FTP_DIST_FOLDER;
}

const filesPathExists = fs.existsSync(filesPath);
if (!filesPathExists) {
    fs.mkdirSync(filesPath, { recursive: true }, throwError);
}


if (!gitExists) {
    console.log("\x1b[35mInitializing git-ftp repository\x1b[0m");
    run("git init -b master", filesPath);

    console.log("\x1b[35mConfiguring git-ftp\x1b[0m");
    run(`git config git-ftp.url ${ftpUrl}`, filesPath);
    run(`git config git-ftp.user ${ftpUser}`, filesPath);
    run(`git config git-ftp.password ${ftpPassword}`, filesPath);

    if (catchup) {
        console.log("\x1b[35mCatching up with FTP\x1b[0m");
        run("git ftp catchup", filesPath);
        console.log("\x1b[32mDone! Synced with FTP\x1b[0m");
        return;
    } else {
        run("git add .", filesPath);
        run("git commit -m 'commit'", filesPath);
        run("git ftp init", filesPath);
        run("git ftp push", filesPath);
        console.log("\x1b[32mDone! Pushed initial files to FTP\x1b[0m");
        return;
    }
}

console.log("\x1b[36mBacking up .git folder\x1b[0m");
copyDir(gitPath, gitBackupPath);

console.log("\x1b[36mClearing old files\x1b[0m");
removeDir(filesPath);

console.log("\x1b[36mCopying new files\x1b[0m");
const distPath = path.join(__dirname, "../", distFolderName);
copyDir(distPath, filesPath);

console.log("\x1b[36mRestoring .git folder\x1b[0m");
copyDir(gitBackupPath, gitPath);

console.log("\x1b[36mRemoving .git backup\x1b[0m");
removeDir(gitBackupPath);

run("git add .", filesPath);
run("git commit -m 'commit'", filesPath);
run("git ftp push", filesPath);
console.log("\x1b[32mDone! Pushed files to FTP\x1b[0m");

function throwError(err) {
    if (err) {
        throw err;
    }
}

function removeDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true }, throwError);
}

function copyDir(src, dest) {
    if (fs.existsSync(dest)) {
        removeDir(dest);
    }
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true }, throwError);

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory()
            ? copyDir(srcPath, destPath)
            : fs.copyFileSync(srcPath, destPath);
    }
}

function run(command, path) {
    try {
        if (path) {
            command = `(cd "${path}" && ${command})`;
        }
        require("child_process").execSync(command, { stdio: "inherit" });
    } catch (error) {
        console.error(`\x1b[38mFailed on command:\n  ${command}`);
        process.exit(error.status);
    }
}
