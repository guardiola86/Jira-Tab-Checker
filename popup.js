document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate-report').addEventListener('click', () => {
    chrome.tabs.query({}, (tabs) => {
      const ticketList = document.getElementById('ticket-list');
      const regex = /([A-Z]+-\d+)/;
      let jiraTickets = [];

      tabs.forEach(tab => {
        const match = tab.url.match(regex);
        if (match) {
          jiraTickets.push({ id: match[1], tabId: tab.id });
        }
      });

      ticketList.innerHTML = ''; // Clear previous list

      if (jiraTickets.length > 0) {
        jiraTickets.forEach(ticket => {
          chrome.scripting.executeScript(
            {
              target: { tabId: ticket.tabId },
              func: getJiraStatus
            },
            (result) => {
              const status = result && result[0]?.result || 'Status not found';
              // Only append if status is not 'Status not found'
              if (status !== 'Status not found') {
                const listItem = document.createElement('li');
                listItem.textContent = `${ticket.id} - ${status}`; // Display ticket ID and status
                ticketList.appendChild(listItem);
              }
            }
          );
        });
      } else {
        ticketList.innerHTML = '<li>No Jira tickets found.</li>';
      }
    });
  });
});

// Function to extract the Jira ticket status from the page
function getJiraStatus() {
  const statusButton = document.querySelector('#issue\\.fields\\.status-view\\.status-button span');
  if (statusButton) {
    return statusButton.textContent.trim(); // Return the status text
  }
  return 'Status not found'; // Return a default value if the status is not found
}
