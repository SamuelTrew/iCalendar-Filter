

export class iCalFilter {
   private data: string = "";

   constructor() {
      this.loadFile = this.loadFile.bind(this);
   }

   loadFile(files: React.ChangeEvent<HTMLInputElement>) {
      const file: File = (files.target.files as FileList)[0];
      const reader: FileReader = new FileReader();
      reader.readAsText(file);

      reader.onloadend = () => {
         this.data = reader.result as string;
      };
   }


}


