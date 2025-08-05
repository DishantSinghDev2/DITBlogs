import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthorsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-32 w-full" />
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="flex justify-center">
              <Skeleton className="h-24 w-24 rounded-full -mt-12 border-4 border-background" />
            </div>
            <div className="mt-4 text-center">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto mt-2" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mx-auto mt-1" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
