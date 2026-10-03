export function optimizeCloudinaryImage(
    url: string | undefined | null,
    width = 800
): string {
    if (!url) return "";

    if (!url.includes("res.cloudinary.com")) {
        return url;
    }

    return url.replace(
        "/upload/",
        `/upload/f_auto,q_auto:good,w_${width},c_limit/`
    );
}