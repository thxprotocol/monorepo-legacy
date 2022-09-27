function logout() {
    const form = document.forms[0];
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'logout';
    input.value = 'yes';
    form.appendChild(input);
    form.submit();
}
logout();
