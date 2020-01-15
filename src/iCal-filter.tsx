import React from "react";

type MyState = {
   data: string,
   eventSet: Set<string>,
   listItems: JSX.Element[],
   checked: Set<string>,
};
type MyProps = {};

export default class CalFilter extends React.Component<MyProps, MyState> {

   constructor(props: any) {
      super(props);
      this.state = {
         data: "",
         eventSet: new Set(),
         listItems: [],
         checked: new Set(),
      };

      this.loadFile = this.loadFile.bind(this);
      this.getEvents = this.getEvents.bind(this);
      this.setChecked = this.setChecked.bind(this);
      this.showSelected = this.showSelected.bind(this);
      this.filterCal = this.filterCal.bind(this);
      this.saveCalendar = this.saveCalendar.bind(this);
   }

   render(): React.ReactElement {
      return (
         <div>
            <button onClick={() => this.showSelected()}>
               SUBMIT
            </button>
            <button onClick={() => this.filterCal()}>
               DOWNLOAD
            </button>
            <input type="file" name="file" onChange={(file) => this.loadFile(file.target.files as FileList)} />
            {[...this.state.eventSet].map((event) =>
               <div key={event}>
                  {event}
                  <input type="checkbox" checked={this.state.checked.has(event)} onChange={() => this.setChecked(event)}/>
               </div>
            )}
         </div>
      )
   }

   private loadFile(files: FileList) {
      const file: File = files[0];
      const reader: FileReader = new FileReader();
      reader.readAsText(file);

      reader.onloadend = () => {
         this.setState({data: reader.result as string});
         this.getEvents();
      };
   }

   private getEvents() {
      const lines: string[] = this.state.data.split("\n");
      let eventSet: Set<string> = new Set();
      let checked: {[key: string]: boolean} = {};

      for (let i: number = 0; i < lines.length; i++) {
         let summary: string = lines[i].slice(0, 7);
         if (summary === "SUMMARY") {
            eventSet.add(lines[i].slice(8));
            checked[lines[i].slice(8).toString()] = false;
         }
      }

      this.setState({eventSet});
   }

   private setChecked(event: string) {
      let checked: Set<string> = this.state.checked;
      if (checked.has(event)) {
         checked.delete(event);
      } else {
         checked.add(event);
      }

      this.setState({checked});
   }

   private showSelected() {
      this.setState({eventSet: this.state.checked})
      this.filterCal();
   }

   private filterCal() {
      const lines: string[] = this.state.data.split("\n");
      let newLines: string[] = [];

      for (let i: number = 0; i < lines.length; i++) {
         if (lines[i].trim() !== "BEGIN:VEVENT") {
            newLines.push(lines[i]);
         } else {
            break;
         }
      }

      let eventLines: string[] = [];
      let keepEvent: boolean = false;

      for (let i: number = 0; i < lines.length; i++) {
         if (lines[i].trim() === "BEGIN:VEVENT") {
            let end: boolean = lines[i].trim() === "END:VEVENT";
            while(!end && i < lines.length) {
               if (lines[i].length >= 8) {
                  let event: string = lines[i].slice(8);
                  if (this.state.checked.has(event)) {
                     keepEvent = true;
                  }
               }

               eventLines.push(lines[i].trim());
               end = lines[i++].trim() === "END:VEVENT";
            }
            if (keepEvent) {
               newLines = newLines.concat(eventLines);
               console.log(eventLines)
            }

            eventLines = [];
            keepEvent = false;
         }
      }

      newLines.push("END:VCALENDAR");
      this.saveCalendar(newLines);
   }

   private saveCalendar(newLines: string[]) {
      const file:string = newLines.join("\n");
      const data = new Blob([file], {type: "text/calendar"});
      const calURL = window.URL.createObjectURL(data);
      const tempLink = document.createElement('a');
      tempLink.href = calURL;
      tempLink.setAttribute("download", "calendar.ics");
      tempLink.click();
   }
}
