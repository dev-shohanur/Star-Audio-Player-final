const googleFormModalElement = document.querySelectorAll(".star-audio-player")


const cssInt = () => {
  var a = document.getElementsByTagName("head")[0];
  var i = document.createElement("link");
  i.rel = "stylesheet";
  i.type = "text/css";
  i.href = "https://states-collins-circle-slim.trycloudflare.com" + "/style.css";
  i.media = "all";
  return a.appendChild(i);
}


if (googleFormModalElement.length > 0) {
  cssInt()
  const ids = [];
  function htmlToElement(html) {
    // Create a temporary template element
    let temp = document.createElement("template");

    // Set the inner HTML of the template
    temp.innerHTML = html;

    // Return the first child of the template's content (the resulting element)
    return temp.content.firstChild;
  }

  let formData = [];
  let buttonStyles = [];



  Array.from(googleFormModalElement).map((item) => {
    const id = item.getAttribute("data-id")
    ids.push(id)

    item.addEventListener("click", () => {

      const data = formData.find(item => item.id == id)
      const modalElementString = `<audio ref="{playerRef}" id="player" controls>
            <source src="${item?.url}" type="audio/mp3" />
          </audio>`;

      const modalElement = htmlToElement(modalElementString);

      const bodyElement = document.getElementsByTagName("body")[0];

      bodyElement.appendChild(modalElement);

      // if (lightboxElement) {
      document.getElementById(`lightbox-${id}`).style.display = "block";
      // }

      document.getElementById(`close-${id}`).addEventListener("click", () => {
        document.getElementById(`lightbox-${id}`).style.display = "none";
      })
    });


  })
  fetch("https://states-collins-circle-slim.trycloudflare.com/api/form/data", {
    method: "POST",
    header: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(ids),
  })
    .then(res => res.json())
    .then(data => {
      formData = data.urls
      buttonStyles = data.buttonStyles
      const buttonHoverStyles = data.buttonHoverStyles


      Array.from(googleFormModalElement).map((item) => {
        const id = item.getAttribute("data-id")
        item.style.cursor = "pointer";

        const buttonStyle = buttonStyles.find(style => style.modalId == id)
        const buttonHoverStyle = buttonHoverStyles.find(style => style.modalId == id)

        if (data?.urls?.length > 0) {
          const getFormData = data?.urls?.find(item => item.id == id)
          item.innerText = getFormData?.title
        }


        Object.keys(buttonStyle).forEach(key => {
          if (key === "id" || key === "modalId") {
            return;
          }
          item.style[key] = buttonStyle[key];
        })

        item.addEventListener("mouseover", async () => {
          Object.keys(buttonHoverStyle).forEach(key => {
            if (key === "id" || key === "modalId") {
              return;
            }
            item.style[key] = buttonHoverStyle[key];
          })
        })

        item.addEventListener("mouseout", async () => {

          Object.keys(buttonStyle).forEach(key => {
            if (key === "id" || key === "modalId") {
              return;
            }
            item.style[key] = buttonStyle[key];
          })
        })


      })
    })

}


