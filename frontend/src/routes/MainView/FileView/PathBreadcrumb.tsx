import { useEffect, useMemo, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { removeTrailingSlash } from "@/lib/utils";

export function PathBreadcrumb({
  path,
  onChangeFilePath,
  ...props
}: {
  path: string;
  onChangeFilePath: (_: string) => void;
} & React.HTMLAttributes<HTMLElement>) {
  const filePathArray: string[] = useMemo(
    () => removeTrailingSlash(path).split("/"),
    [path]
  );
  const breadcrumbListProp = useRef<any>(null);
  const breadcrumbProp = useRef<any>(null);

  function handleBreadcrumbNavigation(i: number) {
    let modifiedFilePath = "";
    for (let j = 0; j <= i; j++) {
      if (filePathArray[j] !== "")
        modifiedFilePath += filePathArray[j].trim() + "/";
    }
    onChangeFilePath("/" + removeTrailingSlash(modifiedFilePath));
  }

  useEffect(() => {
    breadcrumbListProp.current.scrollLeft =
      breadcrumbListProp.current.scrollWidth;
  }, [filePathArray]);

  return (
    <Breadcrumb {...props} ref={breadcrumbProp}>
      <BreadcrumbList
        className="md:max-w-sm lg:max-w-md xl:max-w-max max-h-[3rem] flex-nowrap overflow-x-scroll scrollbar-hide items-center"
        ref={breadcrumbListProp}
      >
        {filePathArray.map((name, i) => (
          <span className="flex items-center" key={i}>
            <BreadcrumbItem
              className="cursor-pointer"
              onClick={() => handleBreadcrumbNavigation(i)}
            >
              <BreadcrumbLink>{name}</BreadcrumbLink>
            </BreadcrumbItem>
            {name !== "" && i !== filePathArray.length - 1 && (
              <BreadcrumbSeparator className="ml-3" />
            )}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
