package com.skillbridge.backend.resume;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Set;

@Service
public class ResumeTextExtractor {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf",
            ".docx",
            ".doc",
            ".txt",
            ".rtf",
            ".odt"
    );

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) throws IOException {

        // 1. Check whether a file was uploaded
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a resume file."
            );
        }

        // 2. Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume file must not exceed 5 MB."
            );
        }

        // 3. Check filename
        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException(
                    "The uploaded file has no filename. Please select your resume again."
            );
        }

        String lowerName = filename.toLowerCase(Locale.ROOT);

        // 4. Check supported extension
        boolean allowed = ALLOWED_EXTENSIONS.stream()
                .anyMatch(lowerName::endsWith);

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Unsupported format. Upload PDF, DOC, DOCX, TXT, RTF or ODT."
            );
        }

        // 5. Detect file type and extract text
        String detectedType;

        try (InputStream input = file.getInputStream()) {
            detectedType = tika.detect(input, filename);
        } catch (IOException exception) {
            throw new IllegalArgumentException(
                    "Could not inspect the file. Please upload it again."
            );
        }

        // 6. Reject unknown or Mac Alias files
        if (detectedType == null
                || detectedType.equalsIgnoreCase("application/octet-stream")
                || detectedType.equalsIgnoreCase("application/x-apple-alias")) {

            throw new IllegalArgumentException(
                    "This file could not be recognized as a document. Please upload the original resume, not a Mac Alias."
            );
        }

        // 7. Extract document text
        String text;

        try (InputStream input = file.getInputStream()) {
            text = tika.parseToString(input);
        } catch (TikaException | IOException exception) {
            throw new IllegalArgumentException(
                    "Could not read this document. Please upload a valid, unprotected file."
            );
        }

        // 8. Check whether readable text was extracted
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "No readable text found. Scanned PDFs may require OCR."
            );
        }

        // 9. Return extracted text
        return text.trim();
    }
}