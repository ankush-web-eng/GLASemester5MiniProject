// import {
//     LlamaParseReader,
// } from "llamaindex";
// import * as fs from 'fs';
// import * as os from 'os';
// import * as path from 'path';

// export async function ParseWithLLama(file: File): Promise<string> {
//     // Create temporary directory
//     const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llama-'));
//     const tempFilePath = path.join(tempDir, 'temp-file');

//     try {
//         // Convert File to Buffer and write to temp file
//         const buffer = await file.arrayBuffer();
//         fs.writeFileSync(tempFilePath, Buffer.from(buffer));

//         const reader = new LlamaParseReader({
//             resultType: "markdown",
//             apiKey: process.env.NEXT_PUBLIC_LLAMA_CLOUD_API_KEY
//         });

//         const documents = await reader.loadData(tempFilePath);

//         const jsonData = {
//             content: documents[0].text,
//             metadata: documents[0].metadata
//         };

//         const jsonString = JSON.stringify(jsonData, null, 2);
//         fs.writeFileSync('parsed_resume.json', jsonString);

//         return jsonString;
//     } finally {
//         // Cleanup: Remove temp file and directory
//         if (fs.existsSync(tempFilePath)) {
//             fs.unlinkSync(tempFilePath);
//         }
//         if (fs.existsSync(tempDir)) {
//             fs.rmdirSync(tempDir);
//         }
//     }
// }