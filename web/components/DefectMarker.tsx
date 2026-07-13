interface Props {
  code: string;
  step?: number;
}

// Emits an HTML comment readable by agents inspecting the DOM source.
// Wrapped in a hidden div because React cannot output bare HTML comments.
export function DefectMarker({ code, step = 1 }: Props) {
  return (
    <div
      aria-hidden="true"
      className="hidden"
      dangerouslySetInnerHTML={{
        __html: `<!-- defect: ${code} | affected_step: ${step} -->`,
      }}
    />
  );
}
