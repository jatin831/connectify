import React from 'react';
import ReactPlayer from 'react-player'
import './Message.css';
import { timestampToLocalTime } from '../../../utility';

const Message = ({message, type, timestamp, author, currentUserId, authorUserId, imgURL, videoURL}) => {
    let displayOutput = null;
    if (type === "text") {
        displayOutput = (
            <p className={"Message " + (currentUserId === authorUserId ? "Message_Received" : "")}>
                <span className="Message_Author">{author}</span>
                    {message}
                <span className="Message_Time">{timestampToLocalTime(timestamp)}</span>
            </p>
        )
    } else if (type === "img") {
        displayOutput = (
            <p className={"Message ImgMessage " + (currentUserId === authorUserId ? "Message_Received" : "")}>
                <span className="Message_Author">{author}</span>
                    <a href={imgURL} target="_blank" rel="noreferrer">
                        <img src={imgURL} />
                    </a>
                <span className="Message_Time">{timestampToLocalTime(timestamp)}</span>
            </p>
        )
    } else if (type === "video") {
        displayOutput = (
            <p className={"Message VideoMessage " + (currentUserId === authorUserId ? "Message_Received" : "")}>
                <span className="Message_Author">{author}</span>
                    <div className="PlayerWrapper">
                    <ReactPlayer controls loop height="100%" width="100%" url={videoURL} />
                    </div>
                <span className="Message_TimeVideo">{timestampToLocalTime(timestamp)}</span>
            </p>
        )
    }

    return displayOutput;
}

export default Message;