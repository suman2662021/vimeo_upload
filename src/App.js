import React, { useState } from 'react';
import tus from 'tus-js-client';
import axios from 'axios';

//from vimeo you get accesstoken
const accessToken = process.env.REACT_APP_VIMEO_ACCESS_TOKEN;

const headerDelete = {
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
  Authorization: `bearer ${accessToken}`,
  'Content-Type': 'application/x-www-form-urlencode'
};

const headerPatch = {
  'Tus-Resumable': '1.0.0',
  'Upload-Offset': 0,
  'Content-Type': 'application/offset+octet-stream',
  Accept: 'application/vnd.vimeo.*+json;version=3.4'
};

const headerPost = {
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
  Authorization: `bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLink, setVideoLink] = useState('');

  const handleChange = async eventObject => {
    
    // Get the selected file from the input element
    const file = eventObject.target.files[0];
    const fileName = file.name;
    const fileSize = file.size.toString();
    console.log(file, fileName, fileSize);

    const response = await axios({
      method: 'post',
      url: `https://api.vimeo.com/me/videos`,
      headers: headerPost,
      data: {
        upload: {
          approach: 'tus',
          size: fileSize
        }
      }
    });

    console.log(response);

    // Create a new tus upload
    const upload = new tus.Upload(file, {
      endPoint: 'https://api.vimeo.com/me/videos',
      uploadUrl: response.data.upload.upload_link,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type
      },
      headers: {},
      onError: function (error) {
        console.log('Failed because: ' + error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + '%');
      },
      onSuccess: function () {
        console.log('Download %s from %s', upload.file.name, upload.url);
        setVideoUrl(upload.url); //from here we set our video url
        setVideoLink(upload.data.link); //this a actual link to the video
      }
    });

    // Start the upload
    upload.start();
  };

  return (
    <>
      <div> Vimeo upload test</div>
      <input onChange={handleChange} type='file' />
      <a href={videoLink}>Video link</a>
    </>
  );
}

export default App;
