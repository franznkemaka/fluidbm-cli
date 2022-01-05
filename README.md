# 👨‍💻⚡ Fluidbm CLI

A simple CLI to convert your Laravel designs (from [Fluidbm](https://fluidbm.com)) into actual code. It generates production-ready Models, Migrations, Factories, Database seeders.

Fluidbm provides a free interface to design **Laravel** models in a modern way: **dead fast and simple**.

## 🎉 Getting started

To get started, you need to design a schema on Fluidbm [here](https://fluidbm.com)

Execute directly

`$ npx fluidbm`

Install via yarn

`$ yarn global add fluidbm-cli`

or

`$ npm install -g fluidbm-cli`

## ℹ️ Usage

### Authentication

In order to interact with CLI, authentication is required:

`$ fluidbm auth`

-   Proceed to your [Fluidbm Account Settings](https://fluidbm.com/account)
-   Press on **Re-generate token** to get a new fresh cli token
-   Paste the **token** in the terminal
-   You're now authenticated ✅

### Exporting to a Laravel project

To add your Fluidbm design to your existing Laravel project, similar to git, you have to copy it using the **clone** command

`$ fluidbm clone [FLUIDBM_PROJECT_URL] or [FLUIDBM_PROJECT_ID]`

Once successfully cloned, the **pull** command can be used at any time to sync the changes done on the design.

`$ fluidbm pull`

It automatically generate the Models, Factories, Seeds and Migrations and add it at the exact place in your existing Laravel project. No need to copy paste files manually....

### Sync design changes

`$ fluidbm pull`

## ⚖️ Terms & Conditions

By using Fluidbm CLI, you agree to the [terms & conditions](https://fluidbm.com/terms), and our [privacy policy](https://fluidbm.com/privacy).
Please avoid sending too many requests to maintain higher availability.
The CLI interacts with Fluidbm API, that might collect and store your IP for security reasons.

## ❤️ Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## ⚖️ License

This project is licensed under the [MIT license](LICENSE)

© 2022 Franz Nkemaka
