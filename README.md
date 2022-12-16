# git-ftp Helper
> A tiny script to help you automate your git-ftp workflow.


## Requirements
- `dotenv` package is required in your project to use this package. You need to either install `dotenv`package or change the js logic written in the `sync.js` file if you don't want to use `dotenv` package.

## Installation
1- Copy the `sync.js` file under `ftp` folder to your project's root directory.

2- Add these env vars to your project's .env file:
```
FTP_URL="ftp.example.com/your/project/directory"
FTP_USER="your_ftp_user"
FTP_PASSWORD="your_ftp_password"
```
\
3- Add this line to your package.json scripts:
```
"ftp": "node ./ftp/sync"
```
\
4- Add this line to your project's .gitignore file:
```
ftp
```
\
5- Run this command in your terminal:
```
npm run ftp
```
*or*
```
yarn ftp
```
*or*
```
pnpm ftp
```

## Configuration
- If your .env file name is not .env, you can change it by changing the `envFileName` variable in the `sync.js` file.
- If your files are already on the remote ftp directory, you can set the `catchup` variable to `true` in the `sync.js` file.
