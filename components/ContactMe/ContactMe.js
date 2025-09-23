function submitForm(event) {
    event.preventDefault();
    alert("Form submitted successfully!");
  }

function autoGrow(element) {
      element.style.height = '0px'; 
      element.style.height = element.scrollHeight + 'px';
    }

