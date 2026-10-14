export interface AvatarProps {
    /** Image URL. Falls back to `initials` (then a person icon) when missing or broken. */
    src?: string;
    /** Alt text for the image. Leave empty for a decorative avatar. */
    alt?: string;
    /** One or two letters shown when there is no usable image. */
    initials?: string;
    /** `rounded` is a square with rounded corners. `round` is a circle. */
    shape?: 'rounded' | 'round';
    /** Any CSS length. */
    size?: string;
}
declare const Avatar: import("svelte").Component<AvatarProps, {}, "">;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
