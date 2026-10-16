import { useState } from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ReportFilter({
  title,
  value,
  options,
  disabled,
  onChange,
}: {
  title: string
  value: string
  options: string[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const defaultValue = options[0]
  const isFiltered = value !== defaultValue
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-9 w-full justify-start border-dashed bg-background sm:w-auto'
          disabled={disabled}
          aria-label={title}
        >
          <PlusCircledIcon className='size-4' />
          {title}
          {isFiltered && (
            <>
              <span aria-hidden className='mx-2 h-4 border-l' />
              <span className='max-w-40 truncate rounded-sm bg-secondary px-1 font-normal text-secondary-foreground'>
                {value}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-50 p-0' align='start'>
        <Command>
          <CommandInput
            placeholder={`Rechercher : ${title.toLocaleLowerCase('fr')}`}
          />
          <CommandList className='max-h-72'>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <div
                    className={cn(
                      'flex size-4 items-center justify-center rounded-sm border border-primary',
                      option === value
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className='size-4 text-background' />
                  </div>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
            {isFiltered && (
              <div className='border-t p-1'>
                <CommandItem
                  className='justify-center text-center'
                  onSelect={() => {
                    onChange(defaultValue)
                    setOpen(false)
                  }}
                >
                  Effacer le filtre
                </CommandItem>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
