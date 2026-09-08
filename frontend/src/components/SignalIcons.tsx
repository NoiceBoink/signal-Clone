import React from "react";

export function SignalChatIcon({
  className = "w-5 h-5",
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  if (filled) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 1.875a8.125 8.125 0 0 0-7.164 11.961.023.023 0 0 1 .003.01L1.574 17.36a.833.833 0 0 0 1.067 1.066l3.512-1.264h.002a8.09 8.09 0 0 0 3.845.964 8.125 8.125 0 1 0 0-16.25Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 1.875a8.125 8.125 0 0 0-7.164 11.961.023.023 0 0 1 .003.01L1.574 17.36a.833.833 0 0 0 1.067 1.066l3.512-1.264h.002a8.09 8.09 0 0 0 3.845.964 8.125 8.125 0 1 0 0-16.25Z" />
    </svg>
  );
}

export function SignalPhoneIcon({
  className = "w-5 h-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.546 2.271a2.42 2.42 0 0 1 3.638.247L8.99 4.896a2.42 2.42 0 0 1-.216 3.175l-.875.876c.027.078.075.187.152.325.229.413.639.95 1.182 1.493.544.544 1.081.954 1.494 1.183.138.077.247.125.325.152l.875-.875a2.42 2.42 0 0 1 3.176-.216l2.378 1.807a2.42 2.42 0 0 1 .247 3.638l-.363.363c-1.308 1.308-3.259 2.025-5.136 1.382a16.727 16.727 0 0 1-6.418-4.011 16.726 16.726 0 0 1-4.01-6.418c-.644-1.877.073-3.828 1.38-5.136l.364-.363Zm2.476 1.13a.962.962 0 0 0-1.445-.098l-.363.363C3.199 4.68 2.76 6.069 3.18 7.298a15.269 15.269 0 0 0 3.662 5.859 15.269 15.269 0 0 0 5.86 3.662c1.228.421 2.617-.018 3.631-1.033l.363-.363a.962.962 0 0 0-.098-1.446l-2.377-1.806a.962.962 0 0 0-1.262.085l-1.035 1.035c-.345.344-.798.318-1.052.269a2.99 2.99 0 0 1-.854-.337c-.56-.312-1.204-.815-1.816-1.426-.611-.612-1.114-1.255-1.426-1.816a2.992 2.992 0 0 1-.337-.854c-.049-.254-.075-.707.269-1.052L7.744 7.04a.962.962 0 0 0 .086-1.262L6.022 3.401Z" />
    </svg>
  );
}

export function SignalStoriesIcon({
  className = "w-5 h-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.22.938c-.675 0-1.225 0-1.671.036-.462.038-.878.118-1.265.315a3.23 3.23 0 0 0-1.411 1.412c-.198.387-.278.802-.316 1.264-.036.447-.036.997-.036 1.671v8.728c0 .674 0 1.224.036 1.67.038.463.118.878.316 1.265.31.608.803 1.102 1.41 1.412.388.197.804.277 1.266.315.446.037.996.037 1.67.037h2.895c.674 0 1.224 0 1.67-.037.463-.038.878-.118 1.265-.316a3.229 3.229 0 0 0 1.412-1.41c.197-.388.277-.803.315-1.265.037-.447.037-.997.037-1.671V5.636c0-.674 0-1.224-.037-1.67-.038-.463-.118-.878-.316-1.265a3.23 3.23 0 0 0-1.41-1.412c-.388-.197-.803-.277-1.265-.315-.447-.037-.997-.037-1.671-.036h-2.895Zm-2.274 1.65c.147-.074.35-.13.721-.16.38-.032.87-.032 1.583-.032h2.833c.712 0 1.203 0 1.583.031.372.03.574.087.721.162.333.17.604.44.774.774.075.147.131.35.162.721.03.38.031.87.031 1.583v8.666c0 .712 0 1.203-.031 1.583-.03.372-.087.574-.162.721-.17.334-.44.604-.774.774-.147.075-.35.131-.721.162-.38.03-.87.031-1.583.031H10.25c-.712 0-1.202 0-1.583-.031-.371-.03-.574-.087-.721-.162a1.77 1.77 0 0 1-.774-.774c-.075-.147-.13-.35-.161-.721-.031-.38-.032-.87-.032-1.583V5.667c0-.712 0-1.203.032-1.583.03-.372.086-.574.161-.721.17-.333.44-.604.774-.774Z"
      />
      <path d="M4.485 2.837c-.1.355-.147.701-.174 1.027a11.35 11.35 0 0 0-.03.6c-.374.138-.65.243-.87.344-.276.127-.402.22-.481.305a1.353 1.353 0 0 0-.354.758c-.014.115-.004.271.076.564.082.3.22.68.423 1.239l1.196 3.285V14.4c0 .242 0 .476.002.702a5.321 5.321 0 0 1-.056-.118 18.513 18.513 0 0 1-.507-1.303L1.695 8.145c-.191-.525-.35-.96-.45-1.324-.104-.38-.163-.746-.116-1.128.072-.59.33-1.14.734-1.575.263-.281.58-.47.939-.635.344-.158.778-.316 1.303-.507l.38-.139Z" />
    </svg>
  );
}

export function SignalSettingsIcon({
  className = "w-5 h-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  if (filled) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.836.971c-.688 0-1.295.45-1.495 1.109l-.398 1.31a.104.104 0 0 1-.047.06l-1.016.587a.104.104 0 0 1-.076.01l-1.333-.31a1.562 1.562 0 0 0-1.708.74L1.599 6.495a1.563 1.563 0 0 0 .213 1.849l.936 1a.102.102 0 0 1 .028.07v1.173c0 .027-.01.052-.028.072l-.936 1a1.562 1.562 0 0 0-.213 1.848l1.164 2.016a1.563 1.563 0 0 0 1.708.74l1.333-.31a.104.104 0 0 1 .076.011l1.016.587c.022.013.04.034.047.06l.398 1.31c.2.658.807 1.109 1.495 1.109h2.328c.688 0 1.295-.45 1.495-1.109l.398-1.31a.105.105 0 0 1 .047-.06l1.016-.587a.104.104 0 0 1 .076-.01l1.334.31a1.562 1.562 0 0 0 1.707-.74l1.164-2.017a1.562 1.562 0 0 0-.212-1.849l-.936-1a.104.104 0 0 1-.029-.07V9.413c0-.027.01-.052.029-.071l.936-1c.47-.503.556-1.253.212-1.85l-1.164-2.015a1.562 1.562 0 0 0-1.707-.74l-1.334.31a.104.104 0 0 1-.076-.011l-1.015-.587a.104.104 0 0 1-.048-.06l-.398-1.31A1.562 1.562 0 0 0 11.164.97H8.836ZM7.396 10a2.604 2.604 0 1 1 5.208 0 2.604 2.604 0 0 1-5.208 0Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 5.938a4.062 4.062 0 1 0 0 8.125 4.062 4.062 0 0 0 0-8.125ZM7.396 10a2.604 2.604 0 1 1 5.208 0 2.604 2.604 0 0 1-5.208 0Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.836.971c-.688 0-1.295.45-1.495 1.109l-.398 1.31a.104.104 0 0 1-.047.06l-1.016.587a.104.104 0 0 1-.076.01l-1.333-.31a1.562 1.562 0 0 0-1.708.74L1.599 6.495a1.563 1.563 0 0 0 .213 1.849l.936 1a.102.102 0 0 1 .028.07v1.173c0 .027-.01.052-.028.072l-.936 1a1.562 1.562 0 0 0-.213 1.848l1.164 2.016a1.563 1.563 0 0 0 1.708.74l1.333-.31a.104.104 0 0 1 .076.011l1.016.587c.022.013.04.034.047.06l.398 1.31c.2.658.807 1.109 1.495 1.109h2.328c.688 0 1.295-.45 1.495-1.109l.398-1.31a.105.105 0 0 1 .047-.06l1.016-.587a.104.104 0 0 1 .076-.01l1.334.31a1.562 1.562 0 0 0 1.707-.74l1.164-2.017a1.562 1.562 0 0 0-.212-1.849l-.936-1a.104.104 0 0 1-.029-.07V9.413c0-.027.01-.052.029-.071l.936-1c.47-.503.556-1.253.212-1.85l-1.164-2.015a1.562 1.562 0 0 0-1.707-.74l-1.334.31a.104.104 0 0 1-.076-.011l-1.015-.587a.104.104 0 0 1-.048-.06l-.398-1.31A1.562 1.562 0 0 0 11.164.97H8.836Zm-.1 1.533a.104.104 0 0 1 .1-.074h2.328c.046 0 .086.03.1.074l.398 1.31c.115.38.37.701.713.9l1.016.586c.343.198.75.258 1.135.168l1.334-.31c.045-.01.091.01.114.049l1.164 2.016c.023.04.017.09-.014.123l-.936 1c-.271.29-.422.671-.422 1.068v1.172c0 .397.15.778.422 1.068l.936 1a.104.104 0 0 1 .014.123l-1.164 2.016a.104.104 0 0 1-.114.05l-1.334-.311a1.563 1.563 0 0 0-1.135.168l-1.016.587c-.343.198-.598.52-.713.899l-.399 1.31a.104.104 0 0 1-.1.074H8.837a.104.104 0 0 1-.1-.074l-.397-1.31a1.566 1.566 0 0 0-.714-.9l-1.016-.585a1.563 1.563 0 0 0-1.135-.17l-1.334.311a.104.104 0 0 1-.114-.049l-1.164-2.016a.104.104 0 0 1 .014-.123l.936-1c.271-.29.422-.671.422-1.068V9.414c0-.397-.15-.778-.422-1.068l-.936-1a.104.104 0 0 1-.014-.123l1.164-2.016c.023-.04.07-.06.114-.05l1.334.311c.386.09.792.03 1.135-.168l1.016-.587c.343-.198.598-.52.714-.899l.398-1.31Z"
      />
    </svg>
  );
}

export function SignalMenuIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.5 5.5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

export function SignalComposeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18.016 1.984a2.202 2.202 0 0 0-3.115 0L7.193 9.693a.73.73 0 0 0-.186.315l-.833 2.917a.73.73 0 0 0 .901.901l2.917-.833a.73.73 0 0 0 .315-.186L18.016 5.1c.86-.86.86-2.255 0-3.115Zm-2.084 1.032a.744.744 0 0 1 1.053 1.052L9.41 11.643l-1.473.42.42-1.473 7.575-7.574Z"
        fill="currentColor"
      />
      <path
        d="M7.802 2.604c-.907 0-1.632 0-2.217.048-.601.05-1.12.152-1.596.395a4.063 4.063 0 0 0-1.775 1.775c-.243.477-.346.995-.395 1.596-.048.586-.048 1.31-.048 2.217v3.563c0 .907 0 1.632.048 2.217.049.601.152 1.12.395 1.596a4.063 4.063 0 0 0 1.775 1.775c.477.243.995.346 1.596.395.585.048 1.31.048 2.217.048h3.563c.907 0 1.632 0 2.217-.048.601-.049 1.12-.152 1.596-.395a4.063 4.063 0 0 0 1.775-1.775c.243-.476.346-.995.395-1.596.048-.585.048-1.31.048-2.217V9.167a.73.73 0 0 0-1.458 0v3c0 .945 0 1.61-.043 2.13-.042.51-.12.815-.241 1.052-.25.49-.648.888-1.138 1.138-.237.12-.542.2-1.053.24-.519.043-1.184.044-2.13.044h-3.5c-.945 0-1.61 0-2.13-.043-.51-.042-.815-.12-1.052-.241a2.604 2.604 0 0 1-1.138-1.138c-.12-.237-.199-.542-.24-1.052-.043-.52-.044-1.185-.044-2.13v-3.5c0-.946 0-1.611.043-2.13.042-.511.12-.816.241-1.053.25-.49.648-.888 1.138-1.138.237-.12.542-.199 1.053-.24.519-.043 1.184-.044 2.13-.044h3a.73.73 0 1 0 0-1.458H7.802Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SignalFilterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.5 4.5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Zm2.5 5.5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5H5.75a.75.75 0 0 1-.75-.75Zm2.5 5.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}
export function SignalMoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.27 11.354a1.354 1.354 0 1 0 0-2.708 1.354 1.354 0 0 0 0 2.708ZM11.354 10a1.354 1.354 0 1 1-2.708 0 1.354 1.354 0 0 1 2.708 0Zm5.729 0a1.354 1.354 0 1 1-2.708 0 1.354 1.354 0 0 1 2.708 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SignalNoteIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6.667 8.23a.73.73 0 1 0 0 1.458h6.666a.73.73 0 0 0 0-1.459H6.667Zm-.73 3.645a.73.73 0 0 1 .73-.73h6.666a.73.73 0 1 1 0 1.46H6.667a.73.73 0 0 1-.73-.73Zm.73 2.188a.73.73 0 0 0 0 1.458h4.166a.73.73 0 0 0 0-1.459H6.667Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.72 1.354h4.56c.675 0 1.225 0 1.671.037.462.037.878.118 1.265.315a3.23 3.23 0 0 1 1.411 1.411c.198.388.278.803.316 1.265.036.447.036.997.036 1.67v7.895c0 .674 0 1.224-.036 1.671-.038.462-.119.877-.316 1.265a3.23 3.23 0 0 1-1.411 1.41c-.387.198-.803.279-1.265.316-.446.037-.996.037-1.67.037H7.719c-.674 0-1.224 0-1.67-.037-.462-.037-.878-.118-1.265-.315a3.23 3.23 0 0 1-1.411-1.411c-.198-.388-.278-.803-.316-1.265-.036-.447-.036-.997-.036-1.67V6.052c0-.674 0-1.224.036-1.671.038-.462.118-.877.316-1.265a3.23 3.23 0 0 1 1.41-1.41c.388-.198.804-.279 1.266-.316.446-.037.996-.037 1.67-.037Zm-1.553 1.49c-.371.03-.574.086-.721.162a1.77 1.77 0 0 0-.774.773c-.075.148-.13.35-.161.722a9.743 9.743 0 0 0-.027.603h11.031a9.696 9.696 0 0 0-.026-.603c-.03-.372-.086-.574-.161-.722a1.77 1.77 0 0 0-.774-.773c-.148-.076-.35-.131-.722-.162-.38-.03-.87-.031-1.582-.031h-4.5c-.712 0-1.202 0-1.583.031ZM4.48 13.917V6.563h11.042v7.354c0 .712 0 1.202-.032 1.582-.03.372-.086.574-.161.722a1.77 1.77 0 0 1-.774.773c-.148.076-.35.131-.722.162-.38.031-.87.032-1.582.032h-4.5c-.712 0-1.202-.001-1.583-.032-.371-.03-.574-.086-.721-.162a1.77 1.77 0 0 1-.774-.773c-.075-.148-.13-.35-.161-.722-.031-.38-.032-.87-.032-1.582Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalGroupIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M10.833 5.957c0-1.778 1.195-3.353 2.917-3.353 1.722 0 2.917 1.575 2.917 3.353 0 .902-.294 1.759-.794 2.404-.499.645-1.242 1.118-2.123 1.118-.88 0-1.624-.473-2.123-1.118-.5-.645-.794-1.502-.794-2.404Zm2.917-1.895c-.694 0-1.458.681-1.458 1.895 0 .594.196 1.134.488 1.511.292.378.643.553.97.553.327 0 .678-.175.97-.553.292-.377.488-.917.488-1.511 0-1.214-.764-1.895-1.458-1.895Z" fill="currentColor"/>
      <path d="M6.25 10.52c.93 0 1.821.202 2.613.564a6.44 6.44 0 0 0-1.03 1.152 4.905 4.905 0 0 0-1.583-.257c-2.23 0-3.934 1.421-4.226 3.125h4.769a6.113 6.113 0 0 0 .05 1.459H1.464a.94.94 0 0 1-.943-.938c0-2.907 2.66-5.104 5.729-5.104Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.75 10.52c-3.07 0-5.73 2.198-5.73 5.105 0 .545.45.938.944.938h9.572a.94.94 0 0 0 .943-.938c0-2.907-2.66-5.104-5.729-5.104Zm0 1.46c2.23 0 3.934 1.42 4.226 3.124H9.524c.292-1.704 1.997-3.125 4.226-3.125Zm-7.5-9.376c-1.722 0-2.917 1.575-2.917 3.353 0 .902.294 1.759.794 2.404.499.645 1.242 1.118 2.123 1.118.881 0 1.624-.473 2.123-1.118.5-.645.794-1.502.794-2.404 0-1.778-1.195-3.353-2.917-3.353ZM4.792 5.957c0-1.214.764-1.895 1.458-1.895.695 0 1.458.681 1.458 1.895 0 .594-.195 1.134-.488 1.511-.292.378-.643.553-.97.553-.327 0-.678-.175-.97-.553-.292-.377-.488-.917-.488-1.511Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalOfficialBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.704 1.357a1.667 1.667 0 0 1 2.592 0l.738.913a.833.833 0 0 0 .864.28l1.133-.304A1.667 1.667 0 0 1 16.13 3.77l.06 1.172a.833.833 0 0 0 .534.735l1.096.42a1.666 1.666 0 0 1 .801 2.465l-.64.984a.833.833 0 0 0 0 .909l.64.983c.579.89.19 2.086-.8 2.465l-1.097.42a.833.833 0 0 0-.534.735l-.06 1.172a1.667 1.667 0 0 1-2.098 1.524l-1.133-.305a.833.833 0 0 0-.864.281l-.738.913a1.667 1.667 0 0 1-2.592 0l-.738-.913a.833.833 0 0 0-.864-.28l-1.134.304a1.667 1.667 0 0 1-2.097-1.524l-.06-1.172a.833.833 0 0 0-.534-.735l-1.096-.42a1.667 1.667 0 0 1-.801-2.465l.64-.984a.833.833 0 0 0 0-.908l-.64-.984a1.667 1.667 0 0 1 .8-2.465l1.097-.42a.833.833 0 0 0 .534-.735l.06-1.172a1.667 1.667 0 0 1 2.097-1.524l1.134.305a.833.833 0 0 0 .864-.281l.738-.913Zm5.248 5.904a.73.73 0 0 0-1.237-.772l-3.622 5.794-1.857-2.322a.73.73 0 0 0-1.139.911l2.5 3.125a.729.729 0 0 0 1.188-.069l4.167-6.667Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalTimerSlashIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10.73 1.25a.73.73 0 0 0-1.46 0v.97a8.179 8.179 0 0 0-3.52 1.148l1.07 1.07A6.741 6.741 0 0 1 10 3.646a6.75 6.75 0 0 1 4.782 1.978l.005.005.006.005a6.75 6.75 0 0 1 1.978 4.783c0 1.15-.287 2.232-.792 3.18l1.07 1.07a8.191 8.191 0 0 0 1.18-4.25c0-2.01-.72-3.852-1.917-5.28l.685-.687a.73.73 0 1 0-1.03-1.03l-.687.685a8.192 8.192 0 0 0-4.55-1.886V1.25ZM2.951 6.167A8.23 8.23 0 0 0 14.25 17.465l-1.069-1.07a6.77 6.77 0 0 1-9.16-9.16L2.952 6.169Z" fill="currentColor"/>
      <path d="M9.27 6.889V6.25a.73.73 0 1 1 1.46 0v2.097L9.27 6.889ZM3.016 2.401a.73.73 0 1 0-1.032 1.031L16.96 18.408a.73.73 0 0 0 1.031-1.031L3.016 2.4Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalEditPencilIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.974 3.026a2.791 2.791 0 0 0-3.948 0L4.043 12.01c-.333.333-.59.736-.751 1.18L2.12 16.412c-.333.914.554 1.8 1.468 1.468l3.223-1.172a3.228 3.228 0 0 0 1.18-.751l8.983-8.983a2.792 2.792 0 0 0 0-3.948Zm-2.917 1.031a1.333 1.333 0 1 1 1.886 1.886L15 6.885 13.114 5l.943-.943Zm-1.974 1.974-7.009 7.01a1.77 1.77 0 0 0-.412.646l-.943 2.594 2.594-.943c.243-.089.464-.23.647-.412l7.009-7.01-1.886-1.885Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalPaletteIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5 12.917a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Zm9.688-5.208a1.25 1.25 0 1 0 0 2.499 1.25 1.25 0 0 0 0-2.5ZM4.063 8.958a1.25 1.25 0 1 1 2.499 0 1.25 1.25 0 0 1-2.499 0Zm8.02-4.478a1.25 1.25 0 1 0 0 2.498 1.25 1.25 0 0 0 0-2.499ZM6.667 5.73a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z" fill="currentColor"/>
      <path d="M10 .938a9.063 9.063 0 0 0 0 18.125 1.838 1.838 0 0 0 1.825-1.893c-.014-.542-.277-.942-.431-1.177a7.085 7.085 0 0 1-.04-.063c-.155-.24-.23-.388-.23-.623 0-.61.422-1.07 1.025-1.07h1.712c2.797-.005 5.201-1.98 5.201-5.202 0-2.159-1.147-4.186-2.81-5.654C14.588 1.91 12.337.938 10 .938ZM2.396 10C2.396 5.8 5.8 2.396 10 2.396c1.94 0 3.856.814 5.287 2.078 1.436 1.268 2.317 2.925 2.317 4.561 0 2.34-1.673 3.74-3.745 3.745h-1.71c-1.502 0-2.483 1.207-2.483 2.527 0 .668.267 1.11.46 1.41.203.318.239.384.242.493v.012a.38.38 0 0 1-.367.382A7.605 7.605 0 0 1 2.396 10Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalSafetyNumberIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M13.952 6.636a.73.73 0 1 0-1.237-.773l-3.622 5.795-1.857-2.322a.73.73 0 0 0-1.139.911l2.5 3.125a.729.729 0 0 0 1.188-.069l4.167-6.667Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.477 18.857a2.396 2.396 0 0 0 3.046 0l3.322-2.736a9.062 9.062 0 0 0 3.268-6.21l.414-4.767a2.396 2.396 0 0 0-1.665-2.492L11.725 1.03a5.73 5.73 0 0 0-3.45 0L3.138 2.652a2.396 2.396 0 0 0-1.665 2.492l.414 4.766a9.062 9.062 0 0 0 3.267 6.21l3.323 2.737Zm2.119-1.126a.937.937 0 0 1-1.192 0L6.08 14.995a7.604 7.604 0 0 1-2.74-5.211l-.415-4.766a.938.938 0 0 1 .652-.975L8.714 2.42a4.27 4.27 0 0 1 2.572 0l5.137 1.622c.419.132.69.537.651.975l-.414 4.766a7.605 7.605 0 0 1-2.742 5.211l-3.322 2.736Z" fill="currentColor"/>
    </svg>
  );
}

export function SignalBlockIcon({
  className = "w-5 h-5",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.354a8.646 8.646 0 1 0 0 17.292 8.646 8.646 0 0 0 0-17.292ZM2.813 10A7.187 7.187 0 0 1 14.54 4.428L4.428 14.541A7.158 7.158 0 0 1 2.813 10Zm2.646 5.572A7.187 7.187 0 0 0 15.571 5.459L5.46 15.572Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SignalSpamIcon({
  className = "w-5 h-5",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        fill="currentColor"
        d="M10 5.417a.995.995 0 0 0-.993 1.071l.353 4.586a.642.642 0 0 0 1.28 0l.352-4.586A.996.996 0 0 0 10 5.417Zm0 7.291a1.042 1.042 0 1 0 0 2.084 1.042 1.042 0 0 0 0-2.084Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12.589 1.354H7.41c-.635 0-1.245.253-1.694.702l-3.66 3.661a2.396 2.396 0 0 0-.702 1.694v5.178c0 .635.253 1.245.702 1.694l3.661 3.661c.45.45 1.059.702 1.694.702h5.178c.635 0 1.245-.253 1.694-.702l3.661-3.661c.45-.45.702-1.059.702-1.694V7.41c0-.635-.253-1.245-.702-1.694l-3.661-3.661a2.396 2.396 0 0 0-1.694-.702ZM7.41 2.812h5.178c.248 0 .487.1.663.275l3.66 3.661a.938.938 0 0 1 .276.663v5.178a.938.938 0 0 1-.275.663l-3.661 3.66a.938.938 0 0 1-.663.276H7.41a.938.938 0 0 1-.663-.275l-3.661-3.661a.937.937 0 0 1-.275-.663V7.41c0-.249.1-.487.275-.663l3.661-3.661a.937.937 0 0 1 .663-.275Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Signal Desktop 3-Dots Menu Icons
export function SignalStopwatchIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 1.8v2.4" />
      <path d="M7.8 1.8h4.4" />
      <circle cx="10" cy="11.2" r="6.8" />
      <path d="M10 7.8v3.4l2.2 1.4" />
    </svg>
  );
}

export function SignalMuteBellIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2.5 2.5 15 15" />
      <path d="M7.4 7.4A4.8 4.8 0 0 0 5.2 9.5v3.5L3.5 15h11" />
      <path d="M14.8 10.5V9.5a4.8 4.8 0 0 0-7.3-4.1" />
      <path d="M8.5 17.5a1.8 1.8 0 0 0 3 0" />
    </svg>
  );
}

export function SignalChatGearIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="2.8" />
      <path d="M16.2 12.3a1.4 1.4 0 0 0 .3 1.5l.1.1a1.6 1.6 0 0 1-2.2 2.2l-.1-.1a1.4 1.4 0 0 0-1.5-.3 1.4 1.4 0 0 0-.9 1.3v.2a1.6 1.6 0 0 1-3.2 0v-.2a1.4 1.4 0 0 0-.9-1.3 1.4 1.4 0 0 0-1.5.3l-.1.1a1.6 1.6 0 0 1-2.2-2.2l.1-.1a1.4 1.4 0 0 0 .3-1.5 1.4 1.4 0 0 0-1.3-.9h-.2a1.6 1.6 0 0 1 0-3.2h.2a1.4 1.4 0 0 0 1.3-.9 1.4 1.4 0 0 0-.3-1.5l-.1-.1a1.6 1.6 0 0 1 2.2-2.2l.1.1a1.4 1.4 0 0 0 1.5.3 1.4 1.4 0 0 0 .9-1.3v-.2a1.6 1.6 0 0 1 3.2 0v.2a1.4 1.4 0 0 0 .9 1.3 1.4 1.4 0 0 0 1.5-.3l.1-.1a1.6 1.6 0 0 1 2.2 2.2l-.1.1a1.4 1.4 0 0 0-.3 1.5 1.4 1.4 0 0 0 1.3.9h.2a1.6 1.6 0 0 1 0 3.2h-.2a1.4 1.4 0 0 0-1.3.9Z" />
    </svg>
  );
}

export function SignalAllMediaIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4.5H4.2A1.7 1.7 0 0 0 2.5 6.2v9.3" />
      <rect x="5.5" y="4.5" width="12" height="11.5" rx="1.8" />
      <circle cx="9.2" cy="8.2" r="1.1" />
      <path d="m17.5 13-3.2-3.2a1 1 0 0 0-1.4 0L7.5 15" />
    </svg>
  );
}

export function SignalCheckmarkCircleIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.8 10.2 2.2 2.2 4.4-4.5" />
    </svg>
  );
}

export function SignalMarkUnreadIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.8c0 3.6-3 6.5-6.7 6.5a7.4 7.4 0 0 1-3.2-.7L3 16.5l.9-3.4A6.3 6.3 0 0 1 3.1 9.8C3.1 6.2 6.1 3.3 9.8 3.3c3.7 0 6.7 2.9 6.7 6.5Z" />
      <path d="M10 7.2a2.6 2.6 0 1 0 2.6 2.6" />
    </svg>
  );
}

export function SignalPinChatIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m14.5 3 2.5 2.5-2 2-1-.5-3.5 3.5.5 1-2 2-3.5-3.5-3.5 3.5-.5-.5 3.5-3.5-3.5-3.5 2-2 1 .5 3.5-3.5-.5-1 2-2 2 2Z" />
      <path d="m3.5 16.5 3.8-3.8" />
    </svg>
  );
}

export function SignalArchiveBoxIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.5" y="3.5" width="15" height="4" rx="1" />
      <path d="M3.5 7.5v8a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-8" />
      <path d="M8 11.5h4" />
    </svg>
  );
}

export function SignalProhibitionIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="m4.7 4.7 10.6 10.6" />
    </svg>
  );
}

export function SignalDeleteTrashIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.5 5.5h13" />
      <path d="M7.5 5.5V3.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M4.5 5.5l1 11.2a1.8 1.8 0 0 0 1.8 1.8h5.4a1.8 1.8 0 0 0 1.8-1.8l1-11.2" />
      <path d="M8.2 9v5.5" />
      <path d="M11.8 9v5.5" />
    </svg>
  );
}

export function SignalSettingsGeneralIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="2.8" />
      <path d="M16.2 12.3a1.4 1.4 0 0 0 .3 1.5l.1.1a1.6 1.6 0 0 1-2.2 2.2l-.1-.1a1.4 1.4 0 0 0-1.5-.3 1.4 1.4 0 0 0-.9 1.3v.2a1.6 1.6 0 0 1-3.2 0v-.2a1.4 1.4 0 0 0-.9-1.3 1.4 1.4 0 0 0-1.5.3l-.1.1a1.6 1.6 0 0 1-2.2-2.2l.1-.1a1.4 1.4 0 0 0 .3-1.5 1.4 1.4 0 0 0-1.3-.9h-.2a1.6 1.6 0 0 1 0-3.2h.2a1.4 1.4 0 0 0 1.3-.9 1.4 1.4 0 0 0-.3-1.5l-.1-.1a1.6 1.6 0 0 1 2.2-2.2l.1.1a1.4 1.4 0 0 0 1.5.3 1.4 1.4 0 0 0 .9-1.3v-.2a1.6 1.6 0 0 1 3.2 0v.2a1.4 1.4 0 0 0 .9 1.3 1.4 1.4 0 0 0 1.5-.3l.1-.1a1.6 1.6 0 0 1 2.2 2.2l-.1.1a1.4 1.4 0 0 0-.3 1.5 1.4 1.4 0 0 0 1.3.9h.2a1.6 1.6 0 0 1 0 3.2h-.2a1.4 1.4 0 0 0-1.3.9Z" />
    </svg>
  );
}

export function SignalSettingsAppearanceIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2.2v2M10 15.8v2M2.2 10h2M15.8 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4" />
    </svg>
  );
}

export function SignalSettingsChatIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 10c0 3.6-3.1 6.5-7 6.5a8.2 8.2 0 0 1-3.4-.7L3 17l1-3.6A6.6 6.6 0 0 1 3 10c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5Z" />
    </svg>
  );
}

export function SignalSettingsCallIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.2 3.5a1.8 1.8 0 0 1 2.5.2l1.6 1.9c.6.7.5 1.7-.1 2.3l-.7.7c.3.7.8 1.5 1.5 2.2.7.7 1.5 1.2 2.2 1.5l.7-.7c.6-.6 1.6-.7 2.3-.1l1.9 1.6a1.8 1.8 0 0 1 .2 2.5l-.9 1c-.9.9-2.3 1.3-3.6.8A14.2 14.2 0 0 1 4.5 9.4 14.2 14.2 0 0 1 3.2 5.1c-.5-1.3-.1-2.7.8-3.6l1-.9Z" />
    </svg>
  );
}

export function SignalSettingsBellIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15.5 13.5v-4a5.5 5.5 0 0 0-11 0v4L3 15h14l-1.5-1.5Z" />
      <path d="M8.5 17.5a2 2 0 0 0 3 0" />
    </svg>
  );
}

export function SignalSettingsLockIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="8.5" width="12" height="9" rx="2" />
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function SignalSettingsDataIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 2.5v15" />
      <path d="M2.5 10a11.2 11.2 0 0 0 15 0" />
      <path d="M2.5 10a11.2 11.2 0 0 1 15 0" />
    </svg>
  );
}

export function SignalSettingsBackupIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.5 10a6.5 6.5 0 1 0 1.9-4.6L3 7.8" />
      <path d="M3 3.5v4.5h4.5" />
      <path d="M10 6.5v3.8l2.5 1.5" />
    </svg>
  );
}

export function SignalSettingsHeartIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.8 4.7a4.2 4.2 0 0 0-6 0L10 5.5l-.8-.8a4.2 4.2 0 0 0-6 6L10 17.5l6.8-6.8a4.2 4.2 0 0 0 0-6Z" />
    </svg>
  );
}

export function SignalPersonUserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="6.2" r="3.2" />
      <path d="M4 16.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    </svg>
  );
}

export function SignalPencilEditIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13.8 3.2a1.8 1.8 0 0 1 2.5 2.5L7.1 15H4.5v-2.6l9.3-9.2Z" />
    </svg>
  );
}

export function SignalAtUsernameIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="3.2" />
      <path d="M13.2 6.8v4.5c0 1.2.8 2 2 2 1.4 0 2.3-1.1 2.3-3.3A7.5 7.5 0 1 0 10 17.5" />
    </svg>
  );
}

export function SignalGlobeIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15" />
      <path d="M10 2.5a11.2 11.2 0 0 1 0 15" />
      <path d="M10 2.5a11.2 11.2 0 0 0 0 15" />
    </svg>
  );
}

export function SignalThemeHalfCircleIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2.5a7.5 7.5 0 1 0 0 15V2.5ZM10 1a9 9 0 1 1 0 18A9 9 0 0 1 10 1Z" />
    </svg>
  );
}



export function SignalZoomIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 4 4" />
      <path d="M9 6.5v5M6.5 9h5" />
    </svg>
  );
}

export function SignalHeartPlusIcon({ className = "w-[19px] h-[19px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 1.5-.55 2.9-1.5 4" />
      <line x1="19" y1="15" x2="19" y2="21" />
      <line x1="16" y1="18" x2="22" y2="18" />
    </svg>
  );
}

export function SignalReplyCurvedIcon({ className = "w-[19px] h-[19px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 15 4 10 9 5" />
      <path d="M20 19v-2a6 6 0 0 0-6-6H4" />
    </svg>
  );
}

export function SignalForwardCurvedIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15 5 20 10 15 15" />
      <path d="M4 19v-2a6 6 0 0 1 6-6h10" />
    </svg>
  );
}

export function SignalSelectCircleIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.5 10 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function SignalCopyOverlappingIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="6.5" y="3.5" width="9.5" height="11" rx="2" />
      <path d="M4 6.5v7.5a2 2 0 0 0 2 2h7" />
    </svg>
  );
}

export function SignalPinSlantedIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m14 3 3 3-2 2-1-1-3 3v2l-1.5 1.5-1.5-1.5-1.5 1.5-2-2 1.5-1.5-1.5-1.5 1.5-1.5h2l3-3-1-1 2-2Z" />
      <path d="m4 16 3-3" />
    </svg>
  );
}

export function SignalInfoLetterIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <circle cx="10" cy="4.5" r="1.6" />
      <rect x="8.5" y="8" width="3" height="8" rx="1.2" />
    </svg>
  );
}

export function SignalTrashCanIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 5.5h12" />
      <path d="M7.5 3.5h5" />
      <path d="M5.5 5.5v10a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5v-10" />
      <path d="M8.5 8.5v5" />
      <path d="M11.5 8.5v5" />
    </svg>
  );
}

export function SignalPhotoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5.417 6.98a1.458 1.458 0 1 1 2.917 0 1.458 1.458 0 0 1-2.917 0Z" fill="currentColor" />
      <path d="M7.802 1.77h4.396c.907 0 1.632 0 2.217.049.602.049 1.12.152 1.596.395a4.062 4.062 0 0 1 1.776 1.775c.242.476.345.995.395 1.596.047.585.047 1.31.047 2.217v4.396c0 .907 0 1.632-.047 2.217-.05.601-.153 1.12-.395 1.596a4.062 4.062 0 0 1-1.776 1.775c-.476.243-.994.346-1.595.395-.586.048-1.31.048-2.218.048H7.802c-.907 0-1.632 0-2.217-.048-.601-.049-1.12-.152-1.596-.395a4.063 4.063 0 0 1-1.775-1.775c-.243-.476-.346-.995-.395-1.596-.048-.585-.048-1.31-.048-2.217V7.802c0-.907 0-1.632.048-2.217.049-.601.152-1.12.395-1.596a4.062 4.062 0 0 1 1.775-1.775c.477-.243.995-.346 1.596-.395.585-.048 1.31-.048 2.217-.048ZM5.704 3.273c-.511.042-.816.12-1.053.241-.49.25-.888.648-1.138 1.138-.12.237-.199.542-.24 1.052-.043.52-.044 1.185-.044 2.13v4.334c0 .404 0 .757.004 1.07l1.948-1.95a2.396 2.396 0 0 1 3.388 0l.598.598 2.472-2.472a2.396 2.396 0 0 1 3.389 0l1.743 1.743V7.833c0-.945 0-1.61-.043-2.13-.042-.51-.12-.815-.24-1.052a2.604 2.604 0 0 0-1.139-1.138c-.236-.12-.542-.2-1.052-.24-.52-.043-1.185-.044-2.13-.044H7.834c-.946 0-1.611 0-2.13.043ZM3.514 15.35a2.6 2.6 0 0 0 1.137 1.138c.237.12.542.2 1.053.24.519.043 1.184.044 2.13.044h4.333c.945 0 1.61 0 2.13-.043.51-.042.816-.12 1.052-.241.49-.25.889-.648 1.138-1.138.12-.237.2-.542.241-1.052.025-.303.035-.654.04-1.082l-2.772-2.77a.937.937 0 0 0-1.325 0l-2.989 2.987a.73.73 0 0 1-1.03 0L7.537 12.32a.938.938 0 0 0-1.326 0l-2.796 2.796c.029.086.061.163.097.234Z" fill="currentColor" />
    </svg>
  );
}

export function SignalFileIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10.57 1.409c.201.048.394.128.571.237.202.124.37.291.546.468l4.532 4.532c.177.177.345.344.468.546.109.177.189.37.237.572.056.23.056.467.055.717v5.466c0 .674 0 1.224-.036 1.671-.038.462-.118.877-.316 1.265a3.23 3.23 0 0 1-1.411 1.41c-.387.198-.803.279-1.265.316-.446.037-.996.037-1.67.037H7.719c-.674 0-1.224 0-1.67-.037-.462-.037-.878-.118-1.265-.315a3.23 3.23 0 0 1-1.411-1.411c-.198-.388-.278-.803-.316-1.265-.036-.447-.036-.997-.036-1.67V6.052c0-.674 0-1.224.036-1.671.038-.462.118-.877.316-1.265a3.23 3.23 0 0 1 1.411-1.41c.387-.198.803-.279 1.265-.316.446-.037.996-.037 1.67-.037h2.133c.25 0 .487 0 .717.055Zm-1.3 1.403H7.75c-.712 0-1.202.001-1.583.032-.371.03-.573.086-.721.161a1.77 1.77 0 0 0-.774.774c-.075.148-.13.35-.161.722-.031.38-.032.87-.032 1.582v7.834c0 .712 0 1.202.032 1.582.03.372.086.574.161.722.17.333.44.604.774.773.148.076.35.131.721.162.38.03.87.032 1.583.032h4.5c.712 0 1.202-.001 1.583-.032.371-.03.573-.086.72-.162.334-.17.605-.44.775-.773.075-.148.13-.35.161-.722.031-.38.032-.87.032-1.582V9.062h-1.552c-.674 0-1.224 0-1.67-.036-.462-.038-.878-.118-1.265-.315a3.23 3.23 0 0 1-1.411-1.412c-.198-.387-.278-.802-.316-1.264-.036-.447-.036-.997-.036-1.671V2.812Zm6.011 4.792-1.104-.937-2.49-2.49-.958-1.125v1.281c0 .712 0 1.203.032 1.583.03.372.086.574.161.721.17.333.44.604.774.774.148.075.35.131.721.162.38.03.87.031 1.583.031h1.281Z" fill="currentColor" />
    </svg>
  );
}

export function SignalPollIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="3.5" width="15" height="5.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6.25h1.5M10 6.25h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2.5" y="11" width="15" height="5.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 13.75h1.5M10 13.75h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

