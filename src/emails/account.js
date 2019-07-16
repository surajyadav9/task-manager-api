const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = async (email , name) => {
    const msg = {
        to: email,
        from:'surajyadav.cse.26@gmail.com',
        subject:`${name}! Welcome to Task Manager App`,
        text:'We are happy to welcome you.Let us know how can we enhance your experience.',
        html:'Thank you :)'
    }

    sgMail.send(msg)
}

const sendGoodbyeEmail = (email , name) => {
    sgMail.send({
        to:email,
        from:'surajyadav.cse.26@gmail.com',
        subject:`Goodbye ${name} !`,
        html:'<h1>We are going to miss you!</h1>'
    })
}


module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}

