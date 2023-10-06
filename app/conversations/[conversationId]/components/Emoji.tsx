"use client";

import { useState } from "react";
import { Popover } from "@headlessui/react";
import { HiFaceSmile } from "react-icons/hi2";
import EmojiPicker from "emoji-picker-react";
import { usePopper } from "react-popper";

const Emoji = (props: { onClick: (...data: any) => void }) => {
  let [referenceElement, setReferenceElement] = useState<any>();
  let [popperElement, setPopperElement] = useState<any>();
  let { styles, attributes } = usePopper(referenceElement, popperElement);
  return (
    <Popover className="relative">
      <Popover.Button
        ref={setReferenceElement}
        className="
            hidden md:block
            rounded-full
            p-2
            bg-sky-500
            cursor-pointer
            hover:bg-sky-600
            transition"
      >
        <HiFaceSmile size={18} className="text-white" />
      </Popover.Button>

      <Popover.Panel
        className="z-10"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {({ close }) => (
          <EmojiPicker
            onEmojiClick={(...data) => {
              props.onClick(...data);
              close();
            }}
            width={300}
            skinTonesDisabled={true}
            previewConfig={{
              showPreview: false,
            }}
          />
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default Emoji;
