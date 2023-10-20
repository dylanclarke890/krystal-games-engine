export abstract class BaseComponent {
  /**
   * The name of this component i.e "Position".
   *
   * Required as using the class name can lead to errors during minification.
   */
  abstract name: string;
}
