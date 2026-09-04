## Crowdsourced number
The server keeps track of a number, and anyone can use the website as an interface to change this number. You can pick an operation (add, subtract, multiply, divide) and a value. The accumulator is then updated to be the result of applying the selected operation with the old accumulator value on the left side and the submitted value on the right side.

You can also view the current state of the number and the past operations submitted by everyone.

**This project is self-hosted at http://www.onocu.com:3010**

## Technical Achievements
- **Single-page app**: Created a single-page app that provides a form for users to submit changes to the number, and responds to changes in the number and operation history by retrieving the latest data from the server.
- **Admin panel with basic authentication**: Added an admin panel to allow more extensive data manipulation for privileged users. The panel and the POST endpoints for its actions are protected by a password stored in a cookie. If a browser does not have the correct value for the cookie, access is denied. This is not a fully secure login system, but it doesn't matter because I'm telling you the password is `churros` right here anyways so you can grade it.
- **Save/restore from file function**: Admins can save the current state of the number and the operation history to a json file, or restore the number and history to a previous state using an existing json file
- **Input validation on all endpoints**: To avoid server crashes, data is checked for validity before it is processed and the operation fails gracefully

### Design/Evaluation Achievements
- **Design Achievement 1**: Myer Cheng helped review the design of the main page and tried adding to the number. There were no problems with completing the tast, but he mentioned that the font sizes and spacing were inconsistent. I implemented his feedback by making the font size more uniform throughout the website.
