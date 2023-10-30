// ==UserScript==
// @name         anchira.to faves
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  custom script for anchira.to faves
// @author       throwaway1245725
// @homepage     https://github.com/throwaway1245725/anchira-faves/
// @match        https://anchira.to/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anchira.to
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function () {
  "use strict";

  const INDEX_URL =
    "https://github.com/throwaway1245725/holy-shit/raw/main/index.json";
  const STAR =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAM1BMVEVHcEz/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDP/rDPIzIGKAAAAEXRSTlMAMK/v/78gcM8QYFDfgECfjzPxc0MAAAFZSURBVHgB7djVYsUwCIBhEoin8v4vO2WeM0jpfN/t0Z+mCif45zyid2DmkG6gA6tAdwIYRWIRbBKxBDaZWLaXsWguY8lcxoK9jBVzGavmMubtZayYy1g1lzFvL2PFXMaquYx5exkr5jJWzWXM28tUba2TSW/8PWTW4FYnsw43Cp2gnPVFp6WdO2xoSCbYgBVPBr7Ak4R0ECZ4wWU6JDt4baEDFhhYO03qKwwVb5gyYw3nN/pYDKQUoniAVUkgclm90QXFq6cskL8IVAqJCmhUElXQ2Ei0gQaSCEGhkULTl9nbuvZoL3Ck4kCyk8oOkkwqGQSRlA4cRTAlnD+O5OEhw+XZtnJpqvvkjlsvHpjX13l15lAUCjwqYeagNB7oeEOod9js3j+cN+Wy3gu8UXbl4g7i6a+hakjp1ZQHStAsyYj8HsXixyg+5MlOcQrt0oFkTSuI1rrCt3cNofAlUpDr+CkAAAAASUVORK5CYII=";

  const expandPreview = () => {
    try {
      const previews = document.getElementById("previews");
      if (previews) {
        previews.getElementsByTagName("footer")[0]?.children[1]?.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cleanArtistName = (artistName) => {
    return decodeURI(artistName.toLowerCase())
      .replace("+", " ")
      .replace(/[^a-zA-Z0-9-]/g, "");
  };

  const loadData = (response) => {
    const indexData = JSON.parse(response.responseText);
    const allFaveUrls = Object.values(indexData).flatMap((a) =>
      Object.values(a)
    );
    const allArtists = Object.keys(indexData).map((a) => cleanArtistName(a));

    return [allFaveUrls, allArtists];
  };

  const decorateImg = (img) => {
    img.style.borderWidth = "4px";
    img.style.borderStyle = "solid";
    img.style.borderColor = "rgb(255 172 51)";
    const starDiv = document.createElement("img");
    starDiv.src = STAR;
    starDiv.style.width = "30px";
    starDiv.style.height = "30px";
    starDiv.style.marginTop = "8px";
    starDiv.style.marginLeft = "-44px";
    starDiv.style.position = "absolute";
    img.after(starDiv);
  };

  const tagGalleries = (allFaveUrls) => {
    const articles = Array.from(
      document.querySelectorAll("#main > #feed > main > article")
    );
    const faves = articles.filter((f) =>
      allFaveUrls.includes(f.querySelector("a.overlay").href)
    );
    for (const fave of faves) {
      const img = fave.querySelector("img");
      decorateImg(img);
    }
  };

  const tagArtists = (allArtists) => {
    const links = Array.from(
      document.querySelectorAll("#main > #tags > main a[href*='/?s=artist:']")
    );
    links
      .filter((a) => {
        const m = a.href.match(
          /https:\/\/.*\/\?s=artist:(?:%22)?%5E(.*)%24(?:%22)?/
        );
        return m && allArtists.includes(cleanArtistName(m[1]));
      })
      .forEach((a) => {
        a.style.color = "rgb(255 171 49)";
      });
  };

  const tagGallery = (allFaveUrls, allArtists) => {
    document
      .getElementById("actions")
      ?.querySelector('form[action^="/favorite/"')
      ?.remove();
    if (allFaveUrls.includes(window.location.href)) {
      const img = document
        .getElementById("cover")
        .getElementsByTagName("img")[0];
      decorateImg(img);
    }
    const galleryMetadata = document.getElementById("metadata");
    if (galleryMetadata) {
      const artists = Array.from(
        galleryMetadata.querySelectorAll(
          "div.tags > a[data-namespace='1'][href*='/?s=artist:']"
        )
      );
      if (artists.length > 0) {
        artists
          .filter((a) => {
            const m = a.href.match(
              /https:\/\/.*\/\?s=artist:(?:%22)?%5E(.*)%24(?:%22)?/
            );
            return m && allArtists.includes(cleanArtistName(m[1]));
          })
          .forEach((a) => {
            a.style.color = "rgb(255 171 49)";
          });
      }
    }
  };

  const tagStuff = (allFaveUrls, allArtists) => {
    tagGalleries(allFaveUrls);

    tagArtists(allArtists);

    tagGallery(allFaveUrls, allArtists);
  };

  const fetchFaves = (response) => {
    const [allFaveUrls, allArtists] = loadData(response);
    processFaves(allFaveUrls, allArtists);
    const observerOptions = {
      attributes: true,
      childList: true,
      subtree: true,
    };
    const observer = new MutationObserver(() =>
      processFaves(allFaveUrls, allArtists)
    );
    observer.observe(document.getElementById("main"), observerOptions);
  };

  const processFaves = (allFaveUrls, allArtists) => {
    tagStuff(allFaveUrls, allArtists);
  };

  expandPreview();
  setInterval(expandPreview, 1000);
  GM.xmlHttpRequest({
    method: "GET",
    url: INDEX_URL,
    onload: fetchFaves,
  });
})();
