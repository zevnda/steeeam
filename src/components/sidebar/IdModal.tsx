'use client'

import type { UserSummary } from '@/types/user-summary'

import { addToast, Modal, ModalBody, ModalContent } from '@heroui/react'
import Link from 'next/link'
import { FaRegCopy } from 'react-icons/fa6'

export default function IdModal({
  isOpen,
  onOpenChange,
  userSummary,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  userSummary: UserSummary
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({
        title: 'Copied to clipboard',
        color: 'success',
        timeout: 2000,
      })
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      className='absolute top-[200px] bg-base border border-light-border max-w-[90%] lg:min-w-[600px] lg:lg:max-w-[800px] py-6'
    >
      <ModalContent>
        <ModalBody>
          <table className='border border-light-border border-separate border-spacing-0 w-full rounded-md text-sm'>
            <tbody>
              {userSummary.customURL && (
                <tr className='hover:bg-base-hover'>
                  <td className='border-b border-light-border p-2'>
                    <p>Vanity URL</p>
                  </td>
                  <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                    <Link href={`https://steamcommunity.com/id/${userSummary.customURL[0]}`} target='_blank'>
                      <p className='truncate'>{userSummary.customURL[0]}</p>
                    </Link>
                  </td>
                  <td
                    className='w-[33px] border-l border-b border-light-border cursor-pointer p-2 group'
                    onClick={() => copyToClipboard(userSummary.customURL[0])}
                  >
                    <FaRegCopy className='group-hover:opacity-70 duration-150' />
                  </td>
                </tr>
              )}
              <tr className='hover:bg-base-hover'>
                <td className='border-b border-light-border p-2'>
                  <p>Short URL</p>
                </td>
                <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                  <Link href={userSummary.shorturl} target='_blank'>
                    <p className='truncate'>{userSummary.shorturl}</p>
                  </Link>
                </td>
                <td
                  className='w-[33px] border-l border-b border-light-border cursor-pointer p-2 group'
                  onClick={() => copyToClipboard(userSummary.shorturl)}
                >
                  <FaRegCopy className='group-hover:opacity-70 duration-150' />
                </td>
              </tr>
              <tr className='hover:bg-base-hover'>
                <td className='border-b border-light-border p-2'>
                  <p>Account ID</p>
                </td>
                <td className='border-l border-b border-light-border p-2'>
                  <p>{userSummary.accountid}</p>
                </td>
                <td
                  className='w-[33px] border-l border-b border-light-border cursor-pointer p-2 group'
                  onClick={() => copyToClipboard(userSummary.accountid)}
                >
                  <FaRegCopy className='group-hover:opacity-70 duration-150' />
                </td>
              </tr>
              <tr className='hover:bg-base-hover'>
                <td className='border-b border-light-border p-2'>
                  <p>Steam ID64</p>
                </td>
                <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                  <Link href={`https://steamcommunity.com/profiles/${userSummary.steamID64[0]}`} target='_blank'>
                    <p className='truncate'>{userSummary.steamID64[0]}</p>
                  </Link>
                </td>
                <td
                  className='w-[33px] border-l border-b border-light-border cursor-pointer p-2 group'
                  onClick={() => copyToClipboard(userSummary.steamID64[0])}
                >
                  <FaRegCopy className='group-hover:opacity-70 duration-150' />
                </td>
              </tr>
              <tr className='hover:bg-base-hover'>
                <td className='border-b border-light-border p-2'>
                  <p>steamID2</p>
                </td>
                <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                  <p className='truncate'>{userSummary.steamID2}</p>
                </td>
                <td
                  className='w-[33px] border-l border-b border-light-border cursor-pointer p-2 group'
                  onClick={() => copyToClipboard(userSummary.steamID2)}
                >
                  <FaRegCopy className='group-hover:opacity-70 duration-150' />
                </td>
              </tr>
              <tr className='hover:bg-base-hover'>
                <td className='p-2'>
                  <p>steamID3</p>
                </td>
                <td className='border-l border-light-border p-2'>
                  <p>{userSummary.steamID3}</p>
                </td>
                <td
                  className='w-[33px] border-l border-light-border cursor-pointer p-2'
                  onClick={() => copyToClipboard(userSummary.steamID3)}
                >
                  <FaRegCopy className='group-hover:opacity-70 duration-150' />
                </td>
              </tr>
            </tbody>
          </table>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
