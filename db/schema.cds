namespace upload;

entity Files {
    key ID : UUID;
    fileName : String;
    
    fileContent : LargeBinary;
}
