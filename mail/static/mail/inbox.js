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
  console.log("compose");
}

function send_mail(event){
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    console.log(recipients + body);

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
        console.log(result);
        load_mailbox('sent');
    });

}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    console.log(mailbox)

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            console.log(emails);
            //iterate over emails received on Json
            emails.forEach(email => {
                console.log(email)
                const element = document.createElement('div');
                const read_style = email.read? '\"': 'list-group-item-dark\"';

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
                element.className = email.read? 'read':'unread';
                element.addEventListener('click', function() {
                    console.log('This element has been clicked!')
                });
                document.querySelector('#emails-view').append(element);
            });
        // ... do something else with emails ...
    });
}

function get_mail(mail_id) {
        // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${mail_id}`)
        .then(response=>json())
        .then(email => {
            console.log(email);

        });
}

function archive_mail(mail_id , state) {
    fetch(`/emails/${mail_id}` , {
        method: 'POST',
        body: JSON.stringify({
            archived: state
        })
    })
}

function mark_read_mail(mail_id , state) {
    fetch(`/emails/${mail_id}` , {
        method: 'POST',
        body: JSON.stringify({
            read: state
        })
    })
}