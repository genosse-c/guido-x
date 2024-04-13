document.addEventListener('DOMContentLoaded', createMenu);

//creates a menu to reach each of the sections in the document
function createMenu(){
    const a = document.createElement('a');

    //iterate over each section in the document
    let entries = Array.from(document.querySelectorAll('section')).map(function(e){
        //add anchor to each section
        let ac = a.cloneNode();
        let hs = (Math.random() + 1).toString(36).substring(4);
        //special case video without title
        let t = '';
        if(e.querySelector('.title')){
            t = e.querySelector('.title').textContent
        } else {
            t = 'Video';
            ac.classList.add('menu-item-video');
        }
        ac.setAttribute('id', hs);
        e.prepend(ac);
        //list of titles and anchors
        return [t, hs]
    })

    //create the menu
    const menu = document.createElement('nav');
    menu.classList.add('menu');
    //create the elements used to display the hamburger
    menu.insertAdjacentHTML('afterbegin', '<input id="menu-toggle" type="checkbox" /><label class="menu-btn" for="menu-toggle"><span></span></label>');

    const ul = document.createElement('ul');
    ul.classList.add('menu-list');
    menu.append(ul);
    const li = document.createElement('li');
    li.classList.add('menu-item');

    //add list of menu entries from entries array generated earlier
    let h1 = document.createElement('h1');
    h1.classList.add('menu-header');
    entries.forEach(function(e,idx){
        let lc = li.cloneNode();
        let ac = a.cloneNode();
        ac.setAttribute('href', `#${e[1]}`)
        ac.textContent = e[0];
        //first element is "Video", rendered with header h1
        if (idx == 0){
            let h1c = h1.cloneNode();
            h1c.append(ac);
            lc.append(h1c);
            ul.append(lc);
        //second element marks the beginning of the presentation
        //it is duplicated and rendered with header h1
        } else if (idx == 1){
            let h1c = h1.cloneNode();
            let lc1 = li.cloneNode();
            let ac1 = a.cloneNode();
            ac1.setAttribute('href', `#${e[1]}`);
            ac1.textContent = "Presentation";
            h1c.append(ac1)
            lc1.append(h1c);
            ul.append(lc1);
            lc.append(ac);
            ul.append(lc);
        } else {
            lc.append(ac);
            ul.append(lc);
        }
    });
    document.querySelector('body').prepend(menu);
}
