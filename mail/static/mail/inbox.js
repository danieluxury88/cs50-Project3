document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Form button action
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_mail(event){
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value +"\n";

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        load_mailbox('sent');
    });

}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            //iterate over emails received on Json
            emails.forEach(email => {
                const element = document.createElement('div');
                const read_style = !email.read? '\"': 'list-group-item-dark\"';

                console.log(read_style);
                element.innerHTML = `
                          <a href="#" class="list-group-item list-group-item-action ${read_style}  aria-current="true" >
                              <div class="d-flex w-100 justify-content-between">
                                  <h5>${email.subject}</h5>
                                  <small >${email.timestamp}</small>
                              </div>
                                <p class="mb-1">${email.body}</p>
                                <small>${email.sender}</small>
                          </a>

                `
                element.addEventListener('click', () => get_mail(email.id));
                document.querySelector('#emails-view').append(element);
            });
        // ... do something else with emails ...
    });
}

function get_mail(mail_id) {
    document.querySelector('#emails-view').innerHTML='';
    document.querySelector('#compose-view').style.display = 'none';


    fetch(`/emails/${mail_id}`)
        .then(response=>response.json())
        .then(email => {
            const element = document.createElement('div');
            element.className = "list-group-item list-group-item-action";
            element.innerHTML = `
                          <p><strong>From: </strong> ${email.sender} </p>
                          <p><strong>To: </strong> ${email.recipients} </p>
                          <p><strong>Subject: </strong> ${email.subject} </p>
                          <p><strong>Timestamp: </strong> ${email.timestamp} </p>
                          <hr/>
                          <p> ${email.body} </p>

                `
            document.querySelector('#emails-view').append(element);

            // reply button
            const replyButton = document.createElement('div');
            replyButton.innerHTML = `
                        <button class="btn btn-primary">Reply</button>
            `
            replyButton.addEventListener('click', () => reply_mail(email));
            document.querySelector('#emails-view').append(replyButton);


            //archive button
            const archiveBtnText = email.archived? "Unarchive":"Archive";
            const archiveBtnStyle = email.archived? '\"btn btn-primary\"':'\"btn btn-danger\"';
            const archiveButton = document.createElement('div');
            archiveButton.innerHTML = `
                        <button class= ${archiveBtnStyle}>${archiveBtnText}</button>
            `
            archiveButton.addEventListener('click', () => archive_mail(email.id, !email.archived));

            document.querySelector('#emails-view').append(archiveButton);

            mark_read_mail(email.id, true);
        });

}

function reply_mail(email ) {
    compose_email();


    // Fill composition fields
    if ( ! email.subject.startsWith("Re: ") ) {
        email.subject = "Re: " + email.subject;
    }

    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value =  email.subject;
    document.querySelector('#compose-body').value = `\nOn ${email.timestamp} ${email.sender} wrote :\n${email.body}`;
    document.querySelector('#compose-body').focus();
    document.querySelector('#compose-body').setSelectionRange(0,0);

}

function archive_mail(mail_id , state) {
    fetch(`/emails/${mail_id}` , {
        method: 'PUT',
        body: JSON.stringify({
            archived: state
        })
    }).then(()=> load_mailbox("inbox"))
}

function mark_read_mail(mail_id , state) {
    fetch(`/emails/${mail_id}` , {
        method: 'PUT',
        body: JSON.stringify({
            read: state
        })
    })
}