document.addEventListener("DOMContentLoaded", function() {
    var max_page = 0
    const user_id = JSON.parse(document.getElementById('user_id').textContent);
    loadPage(" ", 1);
    try {
        document.querySelector("#following").addEventListener('click', () => {
            loadPage("  ", 1);
        })
    } catch {
        console.log("No user logged in");
    }


    // loads the page clicked
    function loadPage(username, page_num) {
        
        // set header to All posts or the profiles username you are on
        // display create new post if you are in all posts or your own profile
        if (username === " ") {
            document.querySelector("#header").innerHTML = "All Posts";
            try {
                document.querySelector(".post_container").style.display = "block";
            } 
            catch {
                console.log("No user logged in");
            }
        } else if (username === "  "){
            document.querySelector("#header").innerHTML = "Following";
        } else {
            if (username != user_id && user_id) {
                let header = document.querySelector("#header");
                header.innerHTML = `${username}`;
                header.style.display = "inline";
                header.style.height = "16px";
                let follow_button = document.createElement('button');
                follow_button.classList.add('btn');
                follow_button.classList.add('btn-primary');
                follow_button.style.fontSize = "14px";
                follow_button.style.padding = "2px";
                follow_button.style.marginLeft = "5px";
                fetch("/get_following")
                .then(response => response.json())
                .then(following => {
                    if (following.includes(username)) {
                        follow_button.innerHTML = "Unfollow";
                    } else {
                        follow_button.innerHTML = "Follow";
                    }
                });
                follow_button.addEventListener('click', () => {
                    fetch(`/follow/${username}`)
                    .then(response => response.json())
                    .then(result => {
                        follow_button.innerHTML = `${result}`;
                        count = parseInt(document.querySelector(".followed_count").innerHTML.match(/(\d+)/));
                        if (result === "Follow") {
                            document.querySelector(".followed_count").innerHTML = `Followers: ${(count - 1).toString()} `;
                        } else {
                            document.querySelector(".followed_count").innerHTML = `Followers: ${(count + 1).toString()} `;
                        }
                    });
                });
                header.append(follow_button);
                document.querySelector(".post_container").style.display = "none";

            } else {
                document.querySelector(".post_container").style.display = "block";
                document.querySelector("#header").innerHTML = `${username}`;
            }
        }
        
        let liked_posts_list = [];
        
        fetch("/get_liked_posts")
        .then(response => response.json())
        .then(liked_posts => {
            liked_posts_list = liked_posts;
            fetch(`/get_posts/${username}/${page_num}`)
            .then(response => response.json())
            .then(result => {
                let posts = result["posts"];
                let num_pages = result["num_pages"];
                let num_following = result["num_following"];
                let num_followed = result["num_followed"];
                
                if (num_following != -1 && num_followed != -1 && !document.querySelector(".follow_count")) {
                    const follow_count = document.createElement('div');
                    follow_count.classList.add("follow_count");
                    const following_count = document.createElement('span');
                    following_count.classList.add("following_count");
                    const followed_count = document.createElement('span');
                    followed_count.classList.add("followed_count");
                    following_count.innerHTML = `Following: ${num_following} `;
                    followed_count.innerHTML = `Followers: ${num_followed} `;
                    follow_count.append(following_count);
                    follow_count.append(followed_count);
                    document.querySelector("#header_container").insertAdjacentElement('beforeend', follow_count);
                }
                
                page_list = document.querySelector(".pagination");
                page_list.innerHTML = "";
                
                if (num_pages > 1 && page_num != 1) {
                    const page = document.createElement("li");
                    page.innerHTML = '<a href="#" class="page-link">Previous</a>';
                    page_list.append(page);
                    page.addEventListener('click', () => {
                        loadPage(username, page_num - 1);
                    });
                }
                for (let i = 1; i <= num_pages; i++) {
                    if (i === 1 || i === num_pages) {
                        paging();
                    } else if (page_num >= 5 && i === 2) {
                        const page = document.createElement("li");
                        page.classList.add("page-item");
                        page.innerHTML = `<a href="#" class="page-link">...</a>`;
                        page_list.append(page);
                    } else if (page_num <= num_pages - 3 && i === num_pages - 1) {
                        const page = document.createElement("li");
                        page.classList.add("page-item");
                        page.innerHTML = `<a href="#" class="page-link">...</a>`;
                        page_list.append(page);
                    } else if (i >= page_num - 2 && i <= page_num + 2) {
                        paging();
                    }
                    function paging() {
                        const page = document.createElement("li");
                        page.classList.add("page-item");
                        page.innerHTML = `<a href="#" class="page-link">${i}</a>`;
                        page_list.append(page);
                        if (i === page_num) {
                            page.classList.add("active");
                        } else {
                            page.addEventListener('click', () => {
                                loadPage(username, i);
                            })
                        }
                    }
                }
                if (num_pages > 1 && page_num != num_pages) {
                    const page = document.createElement("li");
                    page.innerHTML = '<a href="#" class="page-link">Next</a>';
                    page_list.append(page);
                    page.addEventListener('click', () => {
                        loadPage(username, page_num + 1);
                    });
                }

                try {
                    document.querySelector("#user").addEventListener('click', () => {
                        loadPage(user_id, 1);
                    });
                }
                catch {
                    console.log("No user logged in");
                }
                finally {
                    displayPosts(posts, liked_posts_list);
                }

            });
        });    
    }

    var id = null;
    function like_animation(element) {
        var elem = element.querySelector("#liked");
        var size = 17;
        let shrink = false;
        clearInterval(id);
        id = setInterval(frame, 30);
        function frame() {
            if (size === 16) {
                clearInterval(id);
            } else if (size === 20 || shrink) {
                shrink = true;
                size --;
                elem.style.fontSize = size + 'px';
            } else {
                elem.style.fontSize = size + 'px';
                size++;
            }

        }
    }
    
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function displayPosts(posts, liked_posts_list) {
        
        let post_container = document.querySelector('#posts');
        post_container.innerHTML = "";
        
        for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            let container = document.createElement('div');
            container.classList.add("post_container");
            const name = document.createElement('h3');
            name.innerHTML = `${post.user}`;
            
            name.addEventListener('click', () => {
                loadPage(post.user, 1);
            });
            
            const content = document.createElement('p');
            content.innerHTML = `${post.content}`;
            const date = document.createElement('p');
            date.innerHTML = new Date(post.date);
            date.style.color = "#999";
            date.style.margin = "0px";
            const likes = document.createElement('button');
            likes.classList.add("likes")
            const white_heart = "&#129293;";
            const red_heart = "&#128151;";
            
            if (!liked_posts_list.includes(post.id)) {
                likes.innerHTML = `${white_heart}${post.likes}`;
            } else {
                likes.innerHTML = `${red_heart}${post.likes}`;
            }
            
            likes.style.border = "none";
            likes.style.backgroundColor = "white";
            likes.style.padding = "0px";
            likes.style.margin = "0px";
            likes.style.display = "inline";
            likes.style.outline = "none";
            if (user_id) {
                likes.addEventListener('click', () => {
                    fetch(`/like_post/${post.id}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result[1] === 1) {
                            likes.innerHTML = `<span id="liked" style="font-size: 16px;">${red_heart}</span>${result[0]}`;
                            like_animation(likes);
                        } else if(result[1] === -1) {
                            likes.innerHTML = `${white_heart}${result[0]}`;
                        }
                    });
                });
            }
            
            container.append(name);
            
            if (user_id === post.user) {
                const edit = document.createElement('a');
                edit.href = "#"
                edit.classList.add("edit");
                edit.innerHTML = "Edit";
                container.append(edit);
                
                edit.addEventListener('click', () => {
                    const textarea = document.createElement('textarea');
                    textarea.value = content.innerHTML;
                    textarea.classList.add("form-control");
                    edit.replaceWith(textarea);
                    const submit = document.createElement('button');
                    submit.innerHTML = "Save";
                    submit.classList.add("btn");
                    submit.classList.add("btn-primary");
                    content.replaceWith(submit);
                    
                    submit.addEventListener('click', () => {
                        fetch(`/save_post/${post.id}`, {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                "X-CSRFToken": getCookie("csrftoken")
                            },
                            body: JSON.stringify({
                                content: textarea.value,
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.length === 0) {
                                container.remove();
                            } else {
                                content.innerHTML = result;
                                submit.replaceWith(content);
                                textarea.value = result;
                                textarea.replaceWith(edit);
                            }
                        });
                    });
                });
            }
            
            container.append(content);
            container.append(date);
            container.append(likes);
            post_container.append(container);
        }
    }
});
