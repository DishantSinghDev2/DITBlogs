-- Update author avatar URL: replace 'dishis' with 'dishant' in whatsyour.info avatar URLs
UPDATE "User"
SET image = REPLACE(image, 'dishis', 'dishant')
WHERE image LIKE '%whatsyour%dishis%';
