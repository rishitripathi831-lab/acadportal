const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,

  },

});

const sendAssignmentEmail = async (
  to,
  assignment
) => {

  try {

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to,

      subject:
        `New Assignment: ${assignment.title}`,

      html: `

        <h2>
          New Assignment Posted
        </h2>

        <p>
          <b>Title:</b>
          ${assignment.title}
        </p>

        <p>
          <b>Subject:</b>
          ${assignment.subject}
        </p>

        <p>
          <b>Deadline:</b>
          ${assignment.deadline}
        </p>

        <p>
          <b>Branch:</b>
          ${assignment.branch}
        </p>

        <p>
          <b>Semester:</b>
          ${assignment.semester}
        </p>

        <hr/>

        <p>
          AcadPortal Notification System
        </p>

      `,

    });

    console.log(
      "Email sent to:",
      to
    );

  } catch (error) {

    console.error(
      "Email sending failed:",
      error
    );

  }

};

module.exports =
sendAssignmentEmail;