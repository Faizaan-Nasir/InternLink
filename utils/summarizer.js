import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function GenerateSummary(studentData) {
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const prompt = `
        [ System Prompt ]
        Assume the role of an industry expert, who has been provided information only about the branch, year of study, university of study, CGPA and skills of the student fetched from a database. You’ll also be provided with the company name and therole that student’s applying for.
        Your goal is to provide insights from these parameters only. 
        Do not assume any other information. 
        Hence summarize this student's profile in not more than 100 words without any text formatting.

        [ Example]
        For example: The student demonstrates (very) strong academic performance which stands out the most. They also have a lot of skills mentioned making them a good fit for this front-end intern role at OpenAI. However, they are a sophomore and they come from a not so well known university, they have also mentioned a few too many varied skills which may require further validation through projects and experience, and that may also mean the student is unsure of their domain.

        [ Student Data ]
        The student details are mentioned as follows:
        Major: ${studentData.branch}
        Year: ${studentData.year}
        University: ${studentData.university}
        CGPA: ${studentData.cgpa}
        Skills: ${studentData.skills.join(", ")}

        [ Company and Role ]
        The company and role the student is applying for are as follows:
        Company: ${studentData.company || "N/A"}
        Role: ${studentData.role || "N/A"}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
}
